import { useParams } from 'react-router-dom';

export const useUrl = {
  ProjectId: () => {
    const { projectId } = useParams<{ projectId: string }>();
    return projectId;
  },
  DatasourceId: () => {
    const { datasourceId } = useParams<{ datasourceId: string }>();
    return datasourceId;
  },
  Tenant: () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    return tenantId as string;
  },
  SchemaName: () => {
    const { schemaName } = useParams<{ schemaName: string }>();
    return schemaName;
  },
  DigitalTwinName: () => {
    const { digitalTwinName } = useParams<{ digitalTwinName: string }>();
    return digitalTwinName;
  },
  SchemaNameDT: () => {
    const { schemaNameDT } = useParams<{ schemaNameDT: string }>();
    return schemaNameDT;
  },
  IntegrationsSourceName: () => {
    const { integrationsSourceName } = useParams<{
      integrationsSourceName: string;
    }>();
    return integrationsSourceName;
  },
  IntegrationId: () => {
    const { integrationId } = useParams<{
      integrationId: string;
    }>();
    return integrationId;
  },
};
