import { FormElementInstance } from '@/app/(dashboard)/_components/FormElements';

export type ConditionEvaluationResult = {
  hiddenFieldIds: Set<string>;
  editableFieldIds: Set<string>;
  fieldOptionOverrides: Map<string, string[]>;
};

/**
 * Evaluates all ConditionField elements across the form against the current values.
 * Returns:
 * - hiddenFieldIds: Set of element IDs that should NOT be visible to the user.
 * - editableFieldIds: Set of element IDs that should be MADE EDITABLE (e.g. Submission Date & Time).
 * - fieldOptionOverrides: Map of element ID -> array of options that should be visible.
 */
export function evaluateFormConditions(
  elements: FormElementInstance[],
  formValues: Record<string, any>
): ConditionEvaluationResult {
  const hiddenFieldIds = new Set<string>();
  const editableFieldIds = new Set<string>();
  const fieldOptionOverrides = new Map<string, string[]>();

  const conditionElements = elements.filter((el) => el.type === 'ConditionField');
  if (conditionElements.length === 0) {
    return { hiddenFieldIds, editableFieldIds, fieldOptionOverrides };
  }

  // All fields conditionally controlled across all condition elements
  const conditionallyControlledTargets = new Set<string>();
  // Fields whose display condition has been satisfied
  const targetsSatisfied = new Set<string>();

  for (const cond of conditionElements) {
    const extra = cond.extraAttributes || {};
    const {
      sourceFieldId = 'self',
      optionTargets = {},
      targetOptionFieldId = '',
      thenVisibleOptions = [],
      elseVisibleOptions = [],
      // legacy fallback support
      thenAction = 'show',
      thenTargetFields = [],
      thenEditableFields = [],
      thenFieldActions = {},
      elseAction = 'hide',
      elseTargetFields = [],
      compareValue = 'Yes',
    } = extra;

    const actualSourceId = sourceFieldId === 'self' || !sourceFieldId ? cond.id : sourceFieldId;
    const rawVal = formValues[actualSourceId];
    const val = rawVal === undefined || rawVal === null ? '' : String(rawVal).trim();

    const optionKeys = Object.keys(optionTargets || {});
    const hasOptionTargets = optionKeys.length > 0;

    if (hasOptionTargets) {
      // Modern mode: Each option has different questions shown below
      for (const optKey of optionKeys) {
        const fields = optionTargets[optKey];
        if (Array.isArray(fields)) {
          for (const fId of fields) {
            if (fId) conditionallyControlledTargets.add(fId);
          }
        }
      }

      // If user selected an option that matches one of our configured option targets
      if (val && optionTargets[val] && Array.isArray(optionTargets[val])) {
        for (const fId of optionTargets[val]) {
          if (!fId) continue;
          targetsSatisfied.add(fId);

          // If target is Submission Date & Time, automatically make it editable on the form
          const targetEl = elements.find((e) => e.id === fId);
          if (targetEl?.type === 'TsplCurrentDateTimeField') {
            editableFieldIds.add(fId);
          }
        }
      }
    } else {
      // Legacy fallback for previous condition format
      if (Array.isArray(thenTargetFields)) {
        for (const tId of thenTargetFields) {
          if (!tId) continue;
          const act = thenFieldActions[tId] || thenAction;
          if (act === 'show' || act === 'editable') {
            conditionallyControlledTargets.add(tId);
          }
        }
      }

      if (Array.isArray(thenEditableFields)) {
        for (const tId of thenEditableFields) {
          if (tId) conditionallyControlledTargets.add(tId);
        }
      }

      const isMatch = val.length > 0 && val.toLowerCase() === String(compareValue || '').trim().toLowerCase();
      if (isMatch) {
        if (Array.isArray(thenTargetFields)) {
          for (const tId of thenTargetFields) {
            if (!tId) continue;
            const act = thenFieldActions[tId] || thenAction;
            if (act === 'show') {
              targetsSatisfied.add(tId);
            } else if (act === 'editable') {
              targetsSatisfied.add(tId);
              editableFieldIds.add(tId);
            }
          }
        }

        if (Array.isArray(thenEditableFields)) {
          for (const tId of thenEditableFields) {
            if (tId) {
              targetsSatisfied.add(tId);
              editableFieldIds.add(tId);
            }
          }
        }
      }
    }

    // Option-level dropdown filter (if configured)
    if (targetOptionFieldId) {
      if (val === compareValue || (optionTargets && optionTargets[val] && thenVisibleOptions.length > 0)) {
        if (thenVisibleOptions.length > 0) {
          fieldOptionOverrides.set(targetOptionFieldId, thenVisibleOptions);
        }
      } else if (elseVisibleOptions.length > 0) {
        fieldOptionOverrides.set(targetOptionFieldId, elseVisibleOptions);
      }
    }
  }

  // Any field controlled by a condition that is not satisfied is hidden
  for (const tId of conditionallyControlledTargets) {
    if (!targetsSatisfied.has(tId)) {
      hiddenFieldIds.add(tId);
    }
  }

  return { hiddenFieldIds, editableFieldIds, fieldOptionOverrides };
}
