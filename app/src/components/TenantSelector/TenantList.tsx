import React, { useEffect, useState } from 'react';
import { Title } from '@cognite/cogs.js';
import Select from 'react-select';
import { CogniteClient } from '@cognite/sdk';
import { extractTenants } from './utils';

type Props = {
  sdkv3: CogniteClient;
  onTenantChanged: (tenantId: string) => void;
};

type Tenant = { id: string; name: string };

const TenantTitle = () => (
  <Title level={5} style={{ marginBottom: 4, marginTop: 16 }}>
    Tenants
  </Title>
);

const TENANT_LOCALSTORAGE_KEY = 'selected_tenant_id';

const saveTenantId = (id: string) =>
  localStorage.setItem(TENANT_LOCALSTORAGE_KEY, id);

export default function TenantList({ sdkv3, onTenantChanged }: Props) {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(
    localStorage.getItem(TENANT_LOCALSTORAGE_KEY)
  );
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const handleOnChange = (tenantId: string) => {
    setSelectedTenant(tenantId);
    saveTenantId(tenantId);
    onTenantChanged(tenantId);
  };

  useEffect(() => {
    sdkv3.getIdToken().then((token) => {
      if (!token) return;

      const tokensList = extractTenants(token);
      setTenants(tokensList);
      if (!selectedTenant && tokensList?.length > 0) {
        setSelectedTenant(tokensList[0].id);
      }
      localStorage.removeItem(TENANT_LOCALSTORAGE_KEY);
    });
  }, [sdkv3, selectedTenant]);

  if (tenants?.length > 0) {
    const options = tenants.map((d) => ({
      value: d.id,
      label: d.name,
    }));
    const selected = options.find((p) => p.value === selectedTenant) || {
      value: selectedTenant,
      label: selectedTenant,
    };
    return (
      <>
        <TenantTitle />
        <Select
          style={{ margin: '20px 0' }}
          value={selected}
          options={options}
          onChange={(e) => {
            handleOnChange(e?.value || '');
          }}
        />
      </>
    );
  }
  return <></>;
}
