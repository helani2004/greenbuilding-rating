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
  newPage();
  line('Grand summary', 20, true);
  row(['Criterion', 'Maximum', 'Contested'], [347, 74, 82], 10, true);
  for (const category of categories) row([category.title, category.maxPoints, category.points], [347, 74, 82]);
  row(['Total', project.result.maxPoints, project.result.total], [347, 74, 82], 11, true);
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
        row(['Document / description', 'Available', 'File', 'Annex'], widths, 9, true);
        for (const entry of documents) {
          const file = project.files?.[entry.evidenceId];
          if (entry.evidenceId && !file) throw Error('Evidence metadata is missing for ' + entry.label);
          if (entry.evidenceId && file?.detached) throw Error("Evidence was deleted during report generation. Refresh and retry.");
          const number = file && !file.detached ? annex.length + 1 : '';
          if (number) annex.push({number, category: category.title, title, item, entry, file});
          row([entry.label, entry.availability === 'yes' ? 'Yes' : entry.availability === 'no' ? 'No' : '', file?.name, number], widths, 9);
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
