import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Text, TextVariants } from '@patternfly/react-core';

export const createRows = (data) =>
  data.map(({ id, name, job, job_id, status, ruleset, ruleset_id, last_fired_at }) => ({
    id,
    cells: [
      <Fragment key={`[audit-rule-${id}`}>
        <Link
          to={{
            pathname: `/audit-rule/${id}`,
          }}
        >
          {name || id}
        </Link>
      </Fragment>,
      <Fragment key={`[audit-job-${job_id}`}>
        <Link
          to={{
            pathname: `/job/${job_id}`,
          }}
        >
          {job?.name || job_id}
        </Link>
      </Fragment>,
      status,
      <Fragment key={`[audit-ruleset-${ruleset?.id}`}>
        <Link
          to={{
            pathname: `/ruleset/${ruleset?.id}`,
          }}
        >
          {ruleset?.id || ruleset_id}
        </Link>
      </Fragment>,
      <Fragment key={`[audit-last_fired-${id}`}>
        <Text component={TextVariants.small}>
          {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'long' }).format(
            new Date(last_fired_at || 0)
          )}
        </Text>
      </Fragment>,
    ],
  }));
