import { v4 as uuidv4 } from 'uuid';
import {
    ConditionalFormattingConfig,
    ConditionalFormattingConfigWithColorRange,
    ConditionalFormattingConfigWithSingleColor,
    ConditionalFormattingWithConditionalOperator,
    isConditionalFormattingConfigWithColorRange,
    isConditionalFormattingConfigWithSingleColor,
} from '../types/conditionalFormatting';
import {
    ConditionalOperator,
    ConditionalRuleLabels,
} from '../types/conditionalRule';
import {
    Field,
    FilterableItem,
    isFilterableItem,
    TableCalculation,
} from '../types/field';
import { FieldTarget } from '../types/filter';
import assertUnreachable from './assertUnreachable';
import { getItemId, isNumericItem } from './item';

export const createConditionalFormatingRule =
    (): ConditionalFormattingWithConditionalOperator => ({
        id: uuidv4(),
        operator: ConditionalOperator.EQUALS,
        values: [],
    });

export const createConditionalFormattingConfigWithSingleColor = (
    defaultColor: string,
    target: FieldTarget | null = null,
): ConditionalFormattingConfigWithSingleColor => ({
    target,
    color: defaultColor,
    rules: [createConditionalFormatingRule()],
});

export const createConditionalFormattingConfigWithColorRange = (
    defaultColor: string,
    target: FieldTarget | null = null,
): ConditionalFormattingConfigWithColorRange => ({
    target,
    color: {
        start: '#ffffff',
        end: defaultColor,
        steps: 5,
    },
    rule: {
        min: 0,
        max: 100,
    },
});

export const hasMatchingConditionalRules = (
    value: unknown,
    config: ConditionalFormattingConfig | undefined,
) => {
    if (!config) return false;

    const parsedValue = typeof value === 'string' ? Number(value) : value;

    if (isConditionalFormattingConfigWithSingleColor(config)) {
        return config.rules.every((rule) => {
            switch (rule.operator) {
                case ConditionalOperator.NULL:
                    return parsedValue === null;
                case ConditionalOperator.NOT_NULL:
                    return parsedValue !== null;
                case ConditionalOperator.EQUALS:
                    return rule.values.some((v) => parsedValue === v);
                case ConditionalOperator.NOT_EQUALS:
                    return rule.values.some((v) => parsedValue !== v);
                case ConditionalOperator.LESS_THAN:
                    return typeof parsedValue === 'number'
                        ? rule.values.some((v) => parsedValue < v)
                        : false;
                case ConditionalOperator.GREATER_THAN:
                    return typeof parsedValue === 'number'
                        ? rule.values.some((v) => parsedValue > v)
                        : false;
                case ConditionalOperator.STARTS_WITH:
                case ConditionalOperator.ENDS_WITH:
                case ConditionalOperator.INCLUDE:
                case ConditionalOperator.NOT_INCLUDE:
                case ConditionalOperator.LESS_THAN_OR_EQUAL:
                case ConditionalOperator.GREATER_THAN_OR_EQUAL:
                case ConditionalOperator.IN_THE_PAST:
                case ConditionalOperator.NOT_IN_THE_PAST:
                case ConditionalOperator.IN_THE_NEXT:
                case ConditionalOperator.IN_THE_CURRENT:
                case ConditionalOperator.IN_BETWEEN:
                    throw new Error('Not implemented');
                default:
                    return assertUnreachable(
                        rule.operator,
                        'Unknown operator for conditional formatting',
                    );
            }
        });
    }

    if (isConditionalFormattingConfigWithColorRange(config)) {
        if (typeof parsedValue !== 'number') return false;

        return parsedValue >= config.rule.min && parsedValue <= config.rule.max;
    }

    return assertUnreachable(config, 'Unknown conditional formatting config');
};

export const getConditionalFormattingConfig = (
    field: Field | TableCalculation | undefined,
    value: unknown | undefined,
    conditionalFormattings: ConditionalFormattingConfig[] | undefined,
) => {
    if (!conditionalFormattings || !field || !isNumericItem(field))
        return undefined;

    const fieldConfigs = conditionalFormattings.filter(
        (c) => c.target?.fieldId === getItemId(field) || !c.target,
    );

    return fieldConfigs
        .reverse()
        .find((c) => hasMatchingConditionalRules(value, c));
};

export const getConditionalFormattingDescription = (
    field: Field | TableCalculation | undefined,
    conditionalFormattingConfig: ConditionalFormattingConfig | undefined,
    getConditionalRuleLabel: (
        rule: ConditionalFormattingWithConditionalOperator,
        item: FilterableItem,
    ) => ConditionalRuleLabels,
): string | undefined => {
    if (!field || !isFilterableItem(field) || !conditionalFormattingConfig) {
        return undefined;
    }

    if (
        isConditionalFormattingConfigWithColorRange(conditionalFormattingConfig)
    ) {
        return [
            `is greater than or equal to ${conditionalFormattingConfig.rule.min}`,
            `is less than or equal to ${conditionalFormattingConfig.rule.max}`,
        ].join(' and ');
    }

    if (
        isConditionalFormattingConfigWithSingleColor(
            conditionalFormattingConfig,
        )
    ) {
        return conditionalFormattingConfig.rules
            .map((r) => getConditionalRuleLabel(r, field))
            .map((l) => `${l.operator} ${l.value}`)
            .join(' and ');
    }

    return assertUnreachable(
        conditionalFormattingConfig,
        'Unknown conditional formatting config',
    );
};

export const getConditionalFormattingColor = (
    value: unknown,
    conditionalFormattingConfig: ConditionalFormattingConfig | undefined,
    getColorFromRange: (
        value: number,
        config: {
            color: {
                start: string;
                end: string;
                steps: number;
            };
            rule: {
                min: number;
                max: number;
            };
        },
    ) => string | undefined,
) => {
    if (!conditionalFormattingConfig) {
        return undefined;
    }

    if (
        isConditionalFormattingConfigWithColorRange(conditionalFormattingConfig)
    ) {
        const numericValue = typeof value === 'string' ? Number(value) : value;
        if (typeof numericValue !== 'number') return undefined;

        return getColorFromRange(numericValue, conditionalFormattingConfig);
    }

    if (
        isConditionalFormattingConfigWithSingleColor(
            conditionalFormattingConfig,
        )
    ) {
        return conditionalFormattingConfig.color;
    }

    return assertUnreachable(
        conditionalFormattingConfig,
        'Unknown conditional formatting config',
    );
};
