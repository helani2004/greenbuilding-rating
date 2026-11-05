export function validDocumentId(id) {
  return (
    typeof id === 'string' &&
    /^[A-Za-z0-9_-]{1,100}$/.test(id) &&
    !(id in Object.prototype) &&
    !['prototype', 'legacy'].includes(id)
  );
}

export function documentOptions(item) {
  return Array.isArray(item.documentOptions)
    ? item.documentOptions
    : [];
}

export function evidenceComplete(item, answer) {
  const options = documentOptions(item);

  if (!options.length) return false;

  const present = option => {
    const saved = answer?.documents?.[option.id];

    return (
      saved?.availability === 'yes' &&
      typeof saved.evidenceId === 'string' &&
      Boolean(saved.evidenceId)
    );
  };

  const required = options.filter(
    option => option.required !== false
  );

  const common = required.filter(
    option => !option.pathway
  );

  if (!common.every(present)) return false;

  const pathways = [
    ...new Set(
      required
        .filter(option => option.pathway)
        .map(option => option.pathway)
    ),
  ];

  if (
    pathways.length &&
    !pathways.some(pathway =>
      required
        .filter(option => option.pathway === pathway)
        .every(present)
    )
  ) {
    return false;
  }

  return required.length > 0 || options.some(present);
}

export function documentOptionErrors(item) {
  if (item.documentOptions === undefined) return [];

  if (
    !Array.isArray(item.documentOptions) ||
    item.documentOptions.length > 100
  ) {
    return ['Use at most 100 document options.'];
  }

  const ids = new Set();
  const errors = [];

  for (const option of item.documentOptions) {
    if (
      !option ||
      !validDocumentId(option.id) ||
      ids.has(option.id) ||
      typeof option.label !== 'string' ||
      !option.label.trim() ||
      option.label.length > 500 ||
      typeof option.required !== 'boolean' ||
      (
        option.pathway !== undefined &&
        (
          typeof option.pathway !== 'string' ||
          option.pathway.length > 100
        )
      ) ||
      (
        option.guidance !== undefined &&
        (
          typeof option.guidance !== 'string' ||
          option.guidance.length > 10000
        )
      )
    ) {
      errors.push(
        'Each option needs a unique ID, document title and required flag. Pathway and guidance must be text.'
      );
    }

    if (option) ids.add(option.id);
  }

  return errors;
}
