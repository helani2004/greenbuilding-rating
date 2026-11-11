import {
  documentOptions,
  evidenceComplete,
  documentOptionErrors,
} from './documents.mjs';
export const CATEGORY_IDS=['MN','SS','WE','EA','MR','EQ','ID','SC'];
const safeId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]+$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
const filled=v=>v!==undefined&&v!==null&&String(v).trim()!=='';
export function conditionPass(condition,values){const value=values[condition.field];if(!filled(value))return false;switch(condition.operator){case 'eq':return String(value)===String(condition.value);case 'neq':return String(value)!==String(condition.value);case 'gte':return Number.isFinite(Number(value))&&Number(value)>=Number(condition.value);case 'lte':return Number.isFinite(Number(value))&&Number(value)<=Number(condition.value);case 'gt':return Number.isFinite(Number(value))&&Number(value)>Number(condition.value);case 'lt':return Number.isFinite(Number(value))&&Number(value)<Number(condition.value);case 'notEmpty':return filled(value);default:return false;}}
export function rulePoints(item, answer, credit) {
  const values = {
    ...(answer?.values || {answer: answer?.answer}),
  };

  const usesDocuments = documentOptions(item).length > 0;

  if (usesDocuments) {
    if (!evidenceComplete(item, answer)) return 0;
    values.answer = 'yes';
  }

  const fields = item.fields || [
    {id: 'answer', required: true},
  ];

  if (
    fields.some(
      field => field.required && !filled(values[field.id])
    )
  ) {
    return 0;
  }

  if (
    !usesDocuments &&
    item.evidenceRequired !== false &&
    !answer?.evidenceId
  ) {
    return 0;
  }

  const rule = item.rule || {
    type: 'all',
    conditions: [
      {field: 'answer', operator: 'eq', value: 'yes'},
    ],
  };

  const claim = Number(values.claimedPoints);
  const maximum = credit
    ? (filled(values.claimedPoints) && Number.isInteger(claim)
        ? Math.max(0, Math.min(item.maxPoints, claim))
        : item.maxPoints)
    : 1;

  if (rule.type === 'thresholds') {
    const value = values[rule.field];

    if (!filled(value) || !Number.isFinite(Number(value))) {
      return 0;
    }

    const eligible = rule.bands
      .filter(band => Number(value) >= band.min)
      .map(band => band.points);

    return Math.min(maximum, Math.max(0, ...eligible));
  }

  const conditions = rule.conditions || [];

  const matches = conditions.map(condition =>
    conditionPass(condition, values)
  );

  if (rule.type === 'sum') {
    const total = conditions.reduce(
      (sum, condition, index) =>
        sum + (matches[index] ? condition.points : 0),
      0
    );

    return Math.min(maximum, total);
  }

  const passed = rule.type === 'any'
    ? matches.some(Boolean)
    : matches.every(Boolean);

  return passed ? maximum : 0;
}
export function evaluate(standard,answers={}){
 const categories=standard.categories.map(category=>{
  const prerequisites=category.prerequisites.map(item=>({...item,achieved:rulePoints(item,answers[item.id],false)>0}));
  const unlocked=category.implemented!==false&&prerequisites.every(p=>p.achieved);
  const credits=category.credits.map(item=>({...item,points:unlocked?rulePoints(item,answers[item.id],true):0}));
  return {...category,prerequisites,credits,unlocked,points:credits.reduce((sum,c)=>sum+c.points,0)};
 });
 return {categories,total:categories.reduce((sum,c)=>sum+c.points,0),maxPoints:standard.categories.reduce((sum,c)=>sum+c.maxPoints,0),finalReportAvailable:true};
}
export function validateStandard(standard){
 const errors=[];const text=(s,max=5000)=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
 if(!text(standard.label,180))errors.push('Enter a version name (up to 180 characters).');
 if(!text(standard.buildingType,60))errors.push('Enter a building type.');
 if(!Array.isArray(standard.categories)||standard.categories.length!==8)return [...errors,'Exactly eight categories are required.'];
 if(CATEGORY_IDS.some(id=>standard.categories.filter(c=>c.id===id).length!==1))errors.push('Keep the eight fixed category IDs.');
 const itemIds=new Set();
 for(const cat of standard.categories){
  if(!text(cat.title,180))errors.push(`${cat.id}: enter a title.`);
  if(!Number.isFinite(cat.maxPoints)||cat.maxPoints<0)errors.push(`${cat.id}: invalid maximum points.`);
  if(!Array.isArray(cat.prerequisites)||!Array.isArray(cat.credits)){errors.push(`${cat.id}: invalid item lists.`);continue;}
  if(Math.abs(cat.credits.reduce((sum,c)=>sum+Number(c.maxPoints||0),0)-cat.maxPoints)>1e-8)errors.push(`${cat.id}: credit maximums must add up to ${cat.maxPoints}.`);
  for(const item of [...cat.prerequisites,...cat.credits]){
   const prefix=`${cat.id} / ${item.title||item.id}`;
   errors.push(
  ...documentOptionErrors(item).map(
    error => `${prefix}: ${error}`
  )
);
   if (
  item.selectablePoints &&
  (
    !cat.credits.includes(item) ||
    !Number.isInteger(item.maxPoints) ||
    item.maxPoints < 1 ||
    item.maxPoints > 100
  )
) {
  errors.push(
    `${prefix}: selectable points require a whole-number maximum from 1 to 100.`
  );
}

if (item.fields?.some(f => f.id === 'claimedPoints')) {
  errors.push(
    `${prefix}: claimedPoints is reserved for the point selector. Use another field ID.`
  );
}
   if(!text(item.id,100)||!safeId(item.id)||itemIds.has(item.id))errors.push(`${prefix}: use a unique safe item ID.`);itemIds.add(item.id);
   if(!text(item.title,250)||!text(item.help,10000))errors.push(`${prefix}: title and document help are required.`);
   const credit=cat.credits.includes(item);if(credit&&(!Number.isFinite(item.maxPoints)||item.maxPoints<=0))errors.push(`${prefix}: invalid credit points.`);
   if(!Array.isArray(item.fields)||!item.fields.length){errors.push(`${prefix}: add at least one field.`);continue;}
   const fields=new Map();for(const f of item.fields){if(!text(f.id,80)||!safeId(f.id)||fields.has(f.id)||!text(f.label,250)||!['yesno','number','text','select'].includes(f.type))errors.push(`${prefix}: invalid field.`);fields.set(f.id,f);if(f.type==='select'&&(!Array.isArray(f.options)||!f.options.length||f.options.some(o=>!text(o,100))||new Set(f.options).size!==f.options.length))errors.push(`${prefix}: select fields need distinct options.`);}
   const rule=item.rule;if(!rule||!['all','any','thresholds','sum'].includes(rule.type)){errors.push(`${prefix}: invalid rule type.`);continue;}
   if(rule.type==='thresholds'){
    if(fields.get(rule.field)?.type!=='number'||!Array.isArray(rule.bands)||!rule.bands.length)errors.push(`${prefix}: thresholds need a number field and bands.`);
    else for(const band of rule.bands)if(!Number.isFinite(band.min)||!Number.isFinite(band.points)||band.points<0||band.points>(credit?item.maxPoints:1))errors.push(`${prefix}: invalid threshold band.`);
   }else{
    if(!Array.isArray(rule.conditions)||!rule.conditions.length){errors.push(`${prefix}: add rule conditions.`);continue;}
    for(const c of rule.conditions){const f=fields.get(c.field);if(!f||!['eq','neq','gte','lte','gt','lt','notEmpty'].includes(c.operator))errors.push(`${prefix}: invalid condition field/operator.`);if(['gte','lte','gt','lt'].includes(c.operator)&&(f?.type!=='number'||!filled(c.value)||!Number.isFinite(Number(c.value))))errors.push(`${prefix}: numeric comparisons need a number field and value.`);if(rule.type==='sum'&&(!Number.isFinite(c.points)||c.points<0||c.points>(credit?item.maxPoints:1)))errors.push(`${prefix}: invalid condition points.`);}
   }
  }
 }
 if(Math.abs(standard.categories.reduce((s,c)=>s+Number(c.maxPoints||0),0)-100)>1e-8)errors.push('All category maximums must total exactly 100.');
 return errors;
}

export function hasStandardShape(s){
 if(!s||typeof s.label!=='string'||typeof s.buildingType!=='string'||!Array.isArray(s.categories)||s.categories.length!==8)return false;
 for(const c of s.categories){
  if(!c||typeof c.title!=='string')return false;
  for(const group of ['prerequisites','credits']){
   if(!Array.isArray(c[group])||c[group].length>150)return false;
   for(const i of c[group]){
    if(!i||typeof i.id!=='string'||typeof i.title!=='string'||typeof i.help!=='string'||!Array.isArray(i.fields)||i.fields.length>50)return false;
    for(const f of i.fields){
     if(!f||typeof f.id!=='string'||typeof f.label!=='string'||!['yesno','number','text','select'].includes(f.type))return false;
     if(f.type==='select'&&(!Array.isArray(f.options)||f.options.some(o=>typeof o!=='string')))return false;
    }
    if(!i.rule||!['all','any','sum','thresholds'].includes(i.rule.type))return false;
    const entries=i.rule.type==='thresholds'?i.rule.bands:i.rule.conditions;
    if(!Array.isArray(entries)||entries.some(r=>!r||typeof r!=='object'))return false;
   }
  }
 }
 return true;
}
