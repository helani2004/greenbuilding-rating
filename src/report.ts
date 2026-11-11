import type {PDFPage} from 'pdf-lib';

type Data = any;
const clean = (value: unknown) => String(value ?? '').normalize('NFKC')
  .replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/[^\x20-\x7e®\n]/g, '?');

function evidence(project: Data, item: Data) {
  const answer = project.answers[item.id];
  return [
    ...(answer?.evidenceId ? [{
      label: 'Previously saved supporting document',
      availability: answer.answer,
      evidenceId: answer.evidenceId,
    }] : []),
    ...Object.values(answer?.documents || {}),
  ] as Data[];
}

export async function makeReport(project: Data, progress: (message: string) => void) {
  if (!project.result.finalReportAvailable) {
    throw Error('Save at least one assessment response before downloading the report.');
  }
  const {PDFDocument, StandardFonts, rgb} = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  pdf.setTitle('GreenSL Rating Report - ' + project.name);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.12, 0.22, 0.25);
  let page: PDFPage;
  let y: number;
  function newPage() {
    page = pdf.addPage([595, 842]);
    y = 788;
    page.drawText('GreenSL® Rating', {x: 46, y: 810, size: 10, font: bold, color: ink});
  }
  function row(values: unknown[], widths: number[], size = 10, heading = false) {
    const font = heading ? bold : regular;
    const lines = values.map((value, column) => {
      const result = [''];
      for (const word of clean(value).split(/\s+/)) {
        const next = (result.at(-1) + ' ' + word).trim();
        if (font.widthOfTextAtSize(next, size) <= widths[column] - 12) {
          result[result.length - 1] = next;
          continue;
        }
        if (result.at(-1)) result.push('');
        for (const character of word) {
          const part = result.at(-1) + character;
          if (font.widthOfTextAtSize(part, size) > widths[column] - 12) result.push(character);
          else result[result.length - 1] = part;
        }
      }
      return result;
    });
    const height = size + 5;
    const count = Math.max(...lines.map(cell => cell.length));
    if (y - count * height < 46 && count * height < 720) newPage();
    for (let i = 0; i < count; i++) {
      if (y < 46) newPage();
      let x = 46;
      for (const [column, cell] of lines.entries()) {
        if (cell[i]) page.drawText(cell[i], {x, y, size, font, color: ink});
        x += widths[column];
      }
      y -= height;
    }
    y -= 6;
  }
  const line = (value: unknown, size = 11, heading = false) => row([value], [503], size, heading);
  const categories = project.result.categories;
  newPage();
  y = 665;
  line('Green Rating Report', 29, true);
  line(project.name, 21, true);
  line(project.standard.label, 13);
  line(project.reportDetails?.reportDate || new Date().toLocaleDateString('en-GB', {timeZone: 'Asia/Colombo'}));
  newPage();
  line('Introduction', 20, true);
  line(project.reportDetails?.introduction || 'This report records the project assessment, points contested and supporting evidence submitted.');
  line('Project details', 20, true);
  for (const [key, label] of Object.entries(reportFields)) {
    if (key !== 'introduction') row([label, project.reportDetails?.[key] || '—'], [188, 315]);
  }
  const grid = rgb(0.13, 0.13, 0.13);
  const paper = rgb(244 / 255, 244 / 255, 244 / 255);
  const darkGreen = rgb(10 / 255, 96 / 255, 29 / 255);
  const green = rgb(0, 175 / 255, 80 / 255);
  const white = rgb(1, 1, 1);
  const marksWidths = [92, 269, 71, 71];

  function tableRow(
    cells: {text: unknown; width: number; center?: boolean}[],
    fill = paper, color = grid, strong = false, minimumHeight = 23,
    checkPage = (height: number) => {if (y - height < 46) newPage();},
  ) {
    const font = strong ? bold : regular;
    const size = 9;
    const leading = 12;
    const lines = cells.map(cell => {
      const wrapped: string[] = [];
      let current = '';
      for (const word of clean(cell.text).split(/\s+/)) {
        const next = current ? current + ' ' + word : word;
        if (font.widthOfTextAtSize(next, size) <= cell.width - 12) {
          current = next;
          continue;
        }
        if (current) wrapped.push(current);
        current = '';
        for (const character of word) {
          if (font.widthOfTextAtSize(current + character, size) > cell.width - 12) {
            wrapped.push(current);
            current = '';
          }
          current += character;
        }
      }
      wrapped.push(current);
      return wrapped;
    });
    const height = Math.max(minimumHeight, ...lines.map(cell => cell.length * leading + 8));
    checkPage(height);
    let x = 46;
    for (const [index, cell] of cells.entries()) {
      page.drawRectangle({x, y: y - height, width: cell.width, height, color: fill,
        borderColor: grid, borderWidth: 0.6});
      const top = y - (height - (lines[index].length - 1) * leading) / 2 - 3;
      for (const [lineIndex, text] of lines[index].entries()) {
        if (!text) continue;
        const inset = cell.center ? (cell.width - font.widthOfTextAtSize(text, size)) / 2 : 6;
        page.drawText(text, {x: x + inset, y: top - lineIndex * leading, size, font, color});
      }
      x += cell.width;
    }
    y -= height;
  }
  const [idWidth, titleWidth, totalWidth, contestedWidth] = marksWidths;
  const criterionWidth = idWidth + titleWidth;
  function marksHeader() {
    tableRow([{text: 'Summary of the Marks', width: 503, center: true}], paper, darkGreen, true, 28);
    tableRow([
      {text: 'Criteria', width: criterionWidth, center: true},
      {text: 'Total Points', width: totalWidth, center: true},
      {text: 'Contested Points', width: contestedWidth, center: true},
    ], darkGreen, white, true, 29);
  }
  function marksPage() {
    newPage();
    marksHeader();
  }
  function checkMarksPage(height: number) {
    if (y - height < 46) marksPage();
  }

  marksPage();
  for (const [categoryIndex, category] of categories.entries()) {
    if (y < 130) marksPage();
    tableRow([
      {text: `${categoryIndex + 1}.0 ${category.title}`, width: criterionWidth},
      {text: category.maxPoints, width: totalWidth, center: true},
      {text: category.points, width: contestedWidth, center: true},
    ], green, white, true, 25, checkMarksPage);
    for (const [index, item] of category.prerequisites.entries()) {
      tableRow([
        {text: `Prerequisite ${index + 1}`, width: idWidth},
        {text: item.title, width: titleWidth},
        {text: item.achieved ? 'Achieved' : 'Not Achieved', width: totalWidth + contestedWidth, center: true},
      ], paper, grid, false, 23, checkMarksPage);
    }
    for (const item of category.credits) {
      const numberedTitle = String(item.title).match(/^(\d+(?:\.\d+)+)\s+(.+)$/);
      tableRow([
        {text: `Credit ${numberedTitle?.[1] || item.id}`, width: idWidth},
        {text: numberedTitle?.[2] || item.title, width: titleWidth},
        {text: item.maxPoints, width: totalWidth, center: true},
        {text: item.points, width: contestedWidth, center: true},
      ], paper, grid, false, 23, checkMarksPage);
    }
  }
  tableRow([
    {text: 'Total', width: criterionWidth},
    {text: project.result.maxPoints, width: totalWidth, center: true},
    {text: project.result.total, width: contestedWidth, center: true},
  ], darkGreen, white, true, 25, checkMarksPage);

  newPage();
  line('Assessment summary and saved documents', 18, true);
  const annex: Data[] = [];
  for (const category of categories) {
    line(category.title, 15, true);
    for (const [group, title] of [['prerequisites', 'Prerequisite'], ['credits', 'Credit']]) {
      for (const item of category[group]) {
        const answer = project.answers[item.id];
        line(`${title} ${item.id} - ${item.title}`, 11, true);
        if (item.intent) line(item.intent, 10);
        line(group === 'prerequisites'
          ? (item.achieved ? 'Prerequisite achieved' : 'Incomplete')
          : `Points contested: ${item.points} / ${item.maxPoints}`);
        for (const field of item.fields || []) {
          if ((field.id !== 'answer' || !item.documentOptions?.length) && answer?.values?.[field.id] != null &&
              answer.values[field.id] !== '') row([field.label, answer.values[field.id]], [300, 203], 9);
        }
        const documents = evidence(project, item);
        if (!documents.length) continue;
        const widths = [238, 52, 164, 49];
        const headers = ['Document / description', 'Available', 'File', 'Annex'];
        const documentCells = (values: unknown[]) => values.map((text, index) =>
          ({text, width: widths[index], center: index === 1 || index === 3}));
        const documentHeader = () => tableRow(documentCells(headers), darkGreen, white, true);
        if (y < 120) newPage();
        documentHeader();
        for (const entry of documents) {
          const file = project.files?.[entry.evidenceId];
          if (entry.evidenceId && !file) throw Error('Evidence metadata is missing for ' + entry.label);
          if (entry.evidenceId && file?.detached) throw Error("Evidence was deleted during report generation. Refresh and retry.");
          const number = file && !file.detached ? annex.length + 1 : '';
          if (number) annex.push({number, category: category.title, title, item, entry, file});
          const availability = entry.availability === 'yes' ? 'Yes' : entry.availability === 'no' ? 'No' : '';
          tableRow(documentCells([entry.label, availability, file?.name, number]), paper, grid, false, 23, height => {
            if (y - height < 46) {
              newPage();
              line(`${category.title} / ${item.title}`, 10, true);
              documentHeader();
            }
          });
        }
      }
    }
  }
  newPage();
  line('Annexures', 20, true);
  if (!annex.length) line('No supporting files have been uploaded.');
  for (const part of annex) {
    progress(`Adding annexure ${part.number} of ${annex.length}…`);
    const response = await fetch(`/api/projects/${project.id}/evidence/${part.entry.evidenceId}`);
    if (!response.ok) throw Error('Could not download ' + part.file.name + '. Retry the report.');
    const bytes = await response.arrayBuffer();
    newPage();
    line(`Annexure ${part.number} - ${part.category}`, 16, true);
    line(`${part.title} ${part.item.id} - ${part.item.title}`, 13, true);
    line(part.entry.label);
    line(part.file.name);
    try {
      const evidencePdf = await PDFDocument.load(bytes);
      const pages = await pdf.copyPages(evidencePdf, evidencePdf.getPageIndices());
      for (const evidencePage of pages) pdf.addPage(evidencePage);
    } catch {
      await pdf.attach(bytes, `${part.number}-${part.file.name}`, {description: part.entry.label});
      line('Open the original file from the PDF attachments panel.');
    }
  }
  progress('Preparing the PDF download…');
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], {type: 'application/pdf'});
}

export const reportFields = {
  introduction: 'Introduction', client: 'Client', projectManager: 'Project manager',
  architect: 'Architect', structuralEngineer: 'Structural engineer',
  mepEngineer: 'MEP engineer', quantitySurveyor: 'Quantity surveyor',
  greenConsultants: 'Green consultation team', teamLeader: 'Team leader',
  developmentType: 'Type of development', siteArea: 'Site area (m²)',
  footprint: 'Building footprint (m²)', developedArea: 'Developed area (m²)',
  budget: 'Project value', ratingClaimed: 'Rating claimed (optional)', reportDate: 'Report date',
};
