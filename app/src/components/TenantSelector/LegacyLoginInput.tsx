import React, { SyntheticEvent, useState } from 'react';
import { Input, Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { validateTenant } from './api';

type ErrorFeedbackProps = {
  projectMissing?: boolean;
  invalidProject: boolean;
};

function ErrorFeedback({ projectMissing, invalidProject }: ErrorFeedbackProps) {
  if (projectMissing) {
    return <p>Input your project name</p>;
  }
  if (invalidProject) {
    return (
      <>
        <p>Check the following</p>
        <ol>
          <li>Is the CDF project name spelled correctly?</li>
          <li>Is there an Identity Provider set up for your CDF project?</li>
          <li>
            Is the project using a specific CDF cluster, such as “greenfield“?
            If so, update the cluster. You can enter the cluster name if it is
            not listed.
          </li>
          <li>
            Is <strong>{window.location.hostname}</strong> in the allowed
            application domains list?
          </li>
        </ol>
      </>
    );
  }
  return null;
}

const InputHelp = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
  color: var(--cogs-greyscale-grey7);
`;

const ContinueButtonContainer = styled.div`
  margin-top: 24px;
  padding-bottom: 10px;
`;

const sanitize = (input: string): string =>
  input.toLowerCase().replace(/[^a-z0-9-]+/g, '');

type Props = {
  cluster: string;
  onTenantSelected: (tenant: string, cluster?: string) => void;
};

/**
 * Taken from https://github.com/cognitedata/cdf-hub-tenant-selector
 */
export default function LegacyLoginFlow({ cluster, onTenantSelected }: Props) {
  const [projectName, setProjectName] = useState<string>('');
  const [validationStatus, setValidationStatus] = useState<string>('unknown');

  const [showFeedback, setShowFeedback] = useState(false);

  const checkTenantValidity = async (e: SyntheticEvent) => {
    e.preventDefault();

    setShowFeedback(true);

    if (projectName.length === 0) {
      return;
    }

    setValidationStatus('checking');

    try {
      const isTenantValid = await validateTenant(projectName, cluster);
      setValidationStatus(isTenantValid ? 'valid' : 'invalid');
      if (isTenantValid) {
        onTenantSelected(projectName, cluster);
      }
    } catch {
      setValidationStatus('invalid');
    }
  };

  return (
    <>
      <Title level="5">Sign in using CDF project name</Title>
      <InputHelp>
        The last part of the url {window.location.hostname}/
        <strong>project</strong>
      </InputHelp>
      <Input
        placeholder="Project name"
        fullWidth
        style={{ marginTop: 5 }}
        value={projectName}
        onChange={(e) => {
          setProjectName(sanitize(e.target.value));
          setShowFeedback(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            checkTenantValidity(e);
          }
        }}
        error={
          showFeedback && (projectName.length === 0 || !validateTenant)
            ? ' '
            : undefined
        }
      />
      {showFeedback && (
        <ErrorFeedback
          projectMissing={projectName.length === 0}
          invalidProject={validationStatus === 'invalid'}
        />
      )}
      <ContinueButtonContainer>
        <Button
          type="primary"
          onClick={checkTenantValidity}
          loading={validationStatus === 'checking'}
        >
          Continue
        </Button>
      </ContinueButtonContainer>
    </>
  );
}
