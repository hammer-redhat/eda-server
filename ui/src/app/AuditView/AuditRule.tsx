import { Title } from '@patternfly/react-core';
import { Route, Switch, useLocation, useParams } from 'react-router-dom';
import React, { useState, useEffect, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import AppTabs from '@app/shared/app-tabs';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { getTabFromPath } from '@app/utils/utils';
import { TopToolbar } from '@app/shared/top-toolbar';
import { AuditRuleDetails } from '@app/AuditView/audit-rule-details';
import { RuleType } from '@app/Rules/Rules';
import sharedMessages from '../messages/shared.messages';
import { AnyObject } from '@app/shared/types/common-types';
import { fetchAuditRuleDetails } from '@app/API/Audit';

interface TabItemType {
  eventKey: number;
  title: string | ReactNode;
  name: string;
}
const buildRuleTabs = (ruleId: string, intl: AnyObject): TabItemType[] => [
  {
    eventKey: 0,
    title: (
      <div>
        <CaretLeftIcon />
        {intl.formatMessage(sharedMessages.backToAuditView)}
      </div>
    ),
    name: `/audit`,
  },
  { eventKey: 1, title: 'Details', name: `/rule/${ruleId}/details` },
  { eventKey: 2, title: 'Jobs', name: `/rule/${ruleId}/jobs` },
  { eventKey: 3, title: 'Hosts', name: `/rule/${ruleId}/hosts` },
  { eventKey: 4, title: 'Events', name: `/rule/${ruleId}/events` },
];

export const renderRuleTabs = (ruleId: string, intl) => {
  const rule_tabs = buildRuleTabs(ruleId, intl);
  return <AppTabs tabItems={rule_tabs} />;
};

const Rule: React.FunctionComponent = () => {
  const [rule, setRule] = useState<RuleType | undefined>(undefined);

  const { id } = useParams<{ id: string }>();
  const intl = useIntl();

  useEffect(() => {
    fetchAuditRuleDetails(id).then((data) => setRule(data?.data));
  }, []);

  const location = useLocation();
  const currentTab = rule?.id
    ? getTabFromPath(buildRuleTabs(rule.id, intl), location.pathname)
    : intl.formatMessage(sharedMessages.details);
  return (
    <React.Fragment>
      <TopToolbar
        breadcrumbs={[
          {
            title: intl.formatMessage(sharedMessages.audit_view_title),
            key: 'audit-view',
            to: '/rules',
          },
          {
            title: rule?.name || '',
            key: 'details',
            to: `/rule/${rule?.id}`,
          },
          {
            title: currentTab || intl.formatMessage(sharedMessages.details),
            key: 'current_tab',
          },
        ]}
      >
        <Title headingLevel={'h2'}>{`${rule?.name}`}</Title>
      </TopToolbar>
      {rule && (
        <Switch>
          <Route path="/audit/rule/:id">
            <AuditRuleDetails rule={rule} />
          </Route>
        </Switch>
      )}
    </React.Fragment>
  );
};

export { Rule };
