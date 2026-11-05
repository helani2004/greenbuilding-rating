import {documentOptionErrors} from '../shared/documents.mjs';
import {TrashIcon} from './Icons';

type D = any;

type Props = {
  item: D;
  edit: (change: (item: D) => void) => void;
};

export default function DocumentOptionsEditor({
  item,
  edit,
}: Props) {
  const options = item.documentOptions || [];

  return (
    <section className="card">
      <h3>Document dropdown options</h3>

      <p>
        Add the document titles required for this
        prerequisite or credit. Required documents need
        Yes and a saved PDF.
      </p>

      <p>
        Leave the pathway blank for common requirements.
        Give alternative routes different pathway names;
        users must complete the common requirements and
        one complete route.
      </p>

      {!options.length && (
        <p>
          No document list is configured for this item yet.
        </p>
      )}

      {options.map((option: D, index: number) => (
        <div
          className="document-option-row"
          key={option.id}
        >
          <label>
            Option ID
            <input value={option.id} readOnly />
          </label>

          <label>
            Document title
            <input
              maxLength={500}
              value={option.label}
              onChange={event =>
                edit(current => {
                  current.documentOptions[index].label =
                    event.target.value;
                })
              }
            />
          </label>

          <label>
            Alternative pathway
            <input
              maxLength={100}
              placeholder="Optional"
              value={option.pathway || ''}
              onChange={event =>
                edit(current => {
                  current.documentOptions[index].pathway =
                    event.target.value;
                })
              }
            />
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={option.required !== false}
              onChange={event =>
                edit(current => {
                  current.documentOptions[index].required =
                    event.target.checked;
                })
              }
            />
            Required
          </label>

          <button
            type="button"
            className="danger icon-button"
            aria-label={'Remove ' + option.label}
            onClick={() =>
              edit(current => {
                current.documentOptions.splice(index, 1);
              })
            }
          >
            <TrashIcon />
          </button>
        </div>
      ))}

      <div className="actions">
        <button
          type="button"
          className="secondary"
          onClick={() =>
            edit(current => {
              current.documentOptions ||= [];

              current.documentOptions.push({
                id:
                  'doc_' +
                  crypto.randomUUID().slice(0, 8),
                label: 'New document',
                required: true,
              });

              current.selectablePoints = false;
            })
          }
        >
          Add document option
        </button>

        <label>
          Upload dropdown update (.json)

          <input
            type="file"
            accept="application/json,.json"
            onChange={async event => {
              const input = event.currentTarget;

              try {
                const file = input.files?.[0];

                if (!file) return;

                if (file.size > 200000) {
                  throw Error(
                    'Use a JSON list under 200 KB.'
                  );
                }

                const uploadedOptions = JSON.parse(
                  await file.text()
                );

                const errors = documentOptionErrors({
                  documentOptions: uploadedOptions,
                });

                if (errors.length) {
                  throw Error(errors.join('\n'));
                }

                if (
                  !window.confirm(
                    'Replace this draft item’s document options with the uploaded list?'
                  )
                ) {
                  return;
                }

                edit(current => {
                  current.documentOptions =
                    uploadedOptions;

                  current.selectablePoints = false;
                });
              } catch (error) {
                window.alert((error as Error).message);
              } finally {
                input.value = '';
              }
            }}
          />
        </label>

        <button
          type="button"
          className="secondary"
          onClick={() => {
            const blob = new Blob(
              [JSON.stringify(options, null, 2)],
              {type: 'application/json'}
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = item.id + '-documents.json';
            link.click();

            URL.revokeObjectURL(url);
          }}
        >
          Export dropdown JSON
        </button>
      </div>

      <small>
        Keep the existing option ID when renaming a
        document. Save the draft and publish the version.
        Existing projects remain linked to their assigned
        version.
      </small>
    </section>
  );
}
