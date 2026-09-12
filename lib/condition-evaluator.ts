import { FormElementInstance } from '@/app/(dashboard)/_components/FormElements';

export type ConditionEvaluationResult = {
  hiddenFieldIds: Set<string>;
  fieldOptionOverrides: Map<string, string[]>;
};

/**
 * Evaluates all ConditionField elements across the form against the current values.
 * Returns:
 * - hiddenFieldIds: Set of element IDs that should NOT be visible to the user.
 * - fieldOptionOverrides: Map of element ID -> array of options that should be visible.
 */
export function evaluateFormConditions(
  elements: FormElementInstance[],
  formValues: Record<string, any>
): ConditionEvaluationResult {
  const hiddenFieldIds = new Set<string>();
  const fieldOptionOverrides = new Map<string, string[]>();

  const conditionElements = elements.filter((el) => el.type === 'ConditionField');
  if (conditionElements.length === 0) {
    return { hiddenFieldIds, fieldOptionOverrides };
  }

  // Set of all target field IDs that are conditionally controlled via "THEN SHOW" or "ELSE SHOW".
  // Such targets start hidden until their condition is fulfilled.
  const conditionallyShownTargets = new Set<string>();
  const targetsSatisfied = new Set<string>();

  for (const cond of conditionElements) {
    const extra = cond.extraAttributes || {};
    const {
      sourceFieldId = 'self',
      operator = 'equals',
      compareValue = 'Yes',
      thenAction = 'show',
      thenTargetFields = [],
      elseAction = 'hide',
      elseTargetFields = [],
      targetOptionFieldId = '',
      thenVisibleOptions = [],
      elseVisibleOptions = [],
    } = extra;

    // Track targets that depend on a "SHOW" action
    if (thenAction === 'show' && Array.isArray(thenTargetFields)) {
      for (const tId of thenTargetFields) {
        if (tId) conditionallyShownTargets.add(tId);
      }
    }
    if (elseAction === 'show' && Array.isArray(elseTargetFields)) {
      for (const tId of elseTargetFields) {
        if (tId) conditionallyShownTargets.add(tId);
      }
    }

    // Determine the value to test against
    const actualSourceId = sourceFieldId === 'self' || !sourceFieldId ? cond.id : sourceFieldId;
    const rawVal = formValues[actualSourceId];
    const val = rawVal === undefined || rawVal === null ? '' : String(rawVal).trim();
    const targetVal = String(compareValue ?? '').trim();

    let isMatch = false;
    switch (operator) {
      case 'equals':
        isMatch = val.length > 0 && val.toLowerCase() === targetVal.toLowerCase();
        break;
      case 'not_equals':
        isMatch = val.length > 0 && val.toLowerCase() !== targetVal.toLowerCase();
        break;
      case 'contains':
        isMatch = val.length > 0 && val.toLowerCase().includes(targetVal.toLowerCase());
        break;
      case 'not_contains':
        isMatch = val.length > 0 && !val.toLowerCase().includes(targetVal.toLowerCase());
        break;
      case 'is_empty':
        isMatch = val.length === 0 || val === '[]';
        break;
      case 'is_not_empty':
        isMatch = val.length > 0 && val !== '[]';
        break;
      default:
        isMatch = val.length > 0 && val.toLowerCase() === targetVal.toLowerCase();
        break;
    }

    if (isMatch) {
      // Condition matched (TRUE) -> Apply THEN action
      if (thenAction === 'show' && Array.isArray(thenTargetFields)) {
        for (const tId of thenTargetFields) {
          if (tId) targetsSatisfied.add(tId);
        }
      } else if (thenAction === 'hide' && Array.isArray(thenTargetFields)) {
        for (const tId of thenTargetFields) {
          if (tId) hiddenFieldIds.add(tId);
        }
      }

      // If ELSE action is show, but condition is TRUE, those elseTargetFields shouldn't be shown by this condition
      if (elseAction === 'show' && Array.isArray(elseTargetFields)) {
        for (const tId of elseTargetFields) {
          if (tId && !targetsSatisfied.has(tId)) {
            hiddenFieldIds.add(tId);
          }
        }
      }

      // Option-level visibility override for target option field
      if (targetOptionFieldId && Array.isArray(thenVisibleOptions) && thenVisibleOptions.length > 0) {
        fieldOptionOverrides.set(targetOptionFieldId, thenVisibleOptions);
      }
    } else {
      // Condition did not match (FALSE) -> Apply ELSE action
      if (thenAction === 'show' && Array.isArray(thenTargetFields)) {
        for (const tId of thenTargetFields) {
          if (tId && !targetsSatisfied.has(tId)) {
            hiddenFieldIds.add(tId);
          }
        }
      }

      if (elseAction === 'show' && Array.isArray(elseTargetFields)) {
        for (const tId of elseTargetFields) {
          if (tId) targetsSatisfied.add(tId);
        }
      } else if (elseAction === 'hide' && Array.isArray(elseTargetFields)) {
        for (const tId of elseTargetFields) {
          if (tId) hiddenFieldIds.add(tId);
        }
      }

      // Option-level visibility override for target option field
      if (targetOptionFieldId && Array.isArray(elseVisibleOptions) && elseVisibleOptions.length > 0) {
        fieldOptionOverrides.set(targetOptionFieldId, elseVisibleOptions);
      }
    }
  }

  // Any target meant to be shown conditionally that didn't meet the condition is hidden
  for (const tId of conditionallyShownTargets) {
    if (!targetsSatisfied.has(tId)) {
      hiddenFieldIds.add(tId);
    }
  }

  return { hiddenFieldIds, fieldOptionOverrides };
}
