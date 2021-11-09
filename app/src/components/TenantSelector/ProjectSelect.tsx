import React, { useEffect, useState } from 'react';
import { Button, Icon, Title } from '@cognite/cogs.js';
import Select from 'react-select';
import { useQuery } from 'react-query';
import { CogniteClient } from '@cognite/sdk';

type Props = {
  sdkv3: CogniteClient;
  move: (project: string) => void;
};

/**
 * Taken from https://github.com/cognitedata/cdf-hub-tenant-selector
 */
const ProjectTitle = () => (
  <Title level={5} style={{ marginBottom: 4, marginTop: 16 }}>
    Project
  </Title>
);

export default function ProjectSelect({ sdkv3, move }: Props) {
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined
  );
  const { data = [], isFetched } = useQuery<string[]>(
    [sdkv3.getBaseUrl(), 'token/inspect'],
    async () => {
      const result = await sdkv3.get('/api/v1/token/inspect');
      return result.data?.projects?.map(
        (p: { projectUrlName: string }) => p.projectUrlName
      );
    }
  );

  useEffect(() => {
    if (!selectedProject && data.length > 0) {
      setSelectedProject(data[0]);
    }
  }, [data, selectedProject]);

  if (isFetched && data.length === 0) {
    return (
      <>
        <ProjectTitle />

        <p>
          <Icon
            type="ErrorStroked"
            style={{ marginRight: 10, color: '#e32351' }}
          />
          You are successully logged in, but no projects were found. Make sure
          you have access to a CDF project.
        </p>
      </>
    );
  }

  if (isFetched && data.length > 0) {
    const options = data.map((d) => ({ value: d, label: d }));
    const selected = options.find((p) => p.value === selectedProject) || {
      value: selectedProject,
      label: selectedProject,
    };

    return (
      <>
        <ProjectTitle />
        <Select
          style={{ margin: '20px 0' }}
          value={selected}
          options={options}
          onChange={(e) => setSelectedProject(e?.value)}
        />
        <Button
          style={{ marginTop: '16px' }}
          type="primary"
          disabled={!selectedProject}
          onClick={() => {
            if (selectedProject) {
              move(selectedProject);
            }
          }}
        >
          Continue
        </Button>
      </>
    );
  }
  return <></>;
}
