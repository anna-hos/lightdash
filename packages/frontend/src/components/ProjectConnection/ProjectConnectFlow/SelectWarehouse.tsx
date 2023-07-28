import { assertUnreachable, WarehouseTypes } from '@lightdash/common';
import { Avatar, SimpleGrid, Stack, Text } from '@mantine/core';
import { Icon, IconDots } from '@tabler/icons-react';
import { FC } from 'react';
import MantineIcon from '../../common/MantineIcon';
import { ProjectCreationCard } from '../../common/Settings/SettingsCard';
import BigQuery from './Assets/bigquery.svg';
import Databricks from './Assets/databricks.svg';
import PostgressLogo from './Assets/postgresql.svg';
import Redshift from './Assets/redshift.svg';
import Snowflake from './Assets/snowflake.svg';
import Trino from './Assets/trino.svg';
import ConnectTitle from './common/ConnectTitle';
import OnboardingButton from './common/OnboardingButton';
import InviteExpertFooter from './InviteExpertFooter';
import { Wrapper } from './ProjectConnectFlow.styles';

export enum OtherWarehouse {
    Other = 'Other',
}

type WarehouseLabel =
    | {
          label: string;
          key: WarehouseTypes;
          iconType: 'image';
          image: string;
      }
    | {
          label: string;
          key: OtherWarehouse.Other;
          iconType: 'icon';
          Icon: Icon;
      };

const WarehouseTypeLabels: WarehouseLabel[] = [
    {
        label: 'BigQuery',
        key: WarehouseTypes.BIGQUERY,
        iconType: 'image',
        image: BigQuery,
    },
    {
        label: 'Trino',
        key: WarehouseTypes.TRINO,
        iconType: 'image',
        image: Trino,
    },
    {
        label: 'Databricks',
        key: WarehouseTypes.DATABRICKS,
        iconType: 'image',
        image: Databricks,
    },
    {
        label: 'PostgreSQL',
        key: WarehouseTypes.POSTGRES,
        iconType: 'image',
        image: PostgressLogo,
    },
    {
        label: 'Redshift',
        key: WarehouseTypes.REDSHIFT,
        iconType: 'image',
        image: Redshift,
    },
    {
        label: 'Snowflake',
        key: WarehouseTypes.SNOWFLAKE,
        iconType: 'image',
        image: Snowflake,
    },
    {
        label: 'Other',
        key: OtherWarehouse.Other,
        iconType: 'icon',
        Icon: IconDots,
    },
];

export type SelectedWarehouse = typeof WarehouseTypeLabels[number]['key'];

export const getWarehouseLabel = (key: SelectedWarehouse) => {
    return WarehouseTypeLabels.find((w) => w.key === key)?.label ?? null;
};

export const getWarehouseIcon = (key: SelectedWarehouse, size = 'md') => {
    const item = WarehouseTypeLabels.find((w) => w.key === key);
    if (!item) return null;

    switch (item.iconType) {
        case 'image':
            return <Avatar size={size} src={item.image} alt={item.label} />;
        case 'icon':
            return <MantineIcon size={size} icon={item.Icon} />;
        default:
            return assertUnreachable(item, 'Unknown icon type');
    }
};

interface SelectWarehouseProps {
    isCreatingFirstProject: boolean;
    onSelect: (warehouse: SelectedWarehouse) => void;
}

const SelectWarehouse: FC<SelectWarehouseProps> = ({
    isCreatingFirstProject,
    onSelect,
}) => {
    return (
        <Wrapper>
            <ProjectCreationCard>
                <Stack>
                    <ConnectTitle
                        isCreatingFirstProject={isCreatingFirstProject}
                    />

                    <Text color="dimmed">Select your warehouse:</Text>

                    <SimpleGrid cols={2} spacing="sm">
                        {WarehouseTypeLabels.map((item) => (
                            <OnboardingButton
                                key={item.key}
                                leftIcon={getWarehouseIcon(item.key)}
                                onClick={() => onSelect(item.key)}
                            >
                                {item.label}
                            </OnboardingButton>
                        ))}
                    </SimpleGrid>
                </Stack>
            </ProjectCreationCard>

            <InviteExpertFooter />
        </Wrapper>
    );
};
export default SelectWarehouse;
