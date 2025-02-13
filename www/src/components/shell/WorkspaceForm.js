import { Box } from 'grommet'
import React, { useEffect } from 'react'

import { LabelledInput } from '../users/MagicLogin'
import { SuffixedInput } from '../utils/AffixedInput'

import { isAlphanumeric } from './validation'

function isSubdomain(val) {
  if (/[a-z][a-z0-9-]+\.onplural\.sh/.test(val)) return null

  return 'must be a valid onplural.sh subdomain'
}

export const WORKSPACE_VALIDATIONS = [
  { field: 'workspace.cluster', func: isAlphanumeric, name: 'cluster' },
  { field: 'workspace.bucketPrefix', func: isAlphanumeric, name: 'bucket prefix' },
  { field: 'workspace.subdomain', func: isSubdomain, name: 'subdomain' },
]

export function WorkspaceForm({ demo, workspace, setWorkspace }) {
  useEffect(() => {
    if (demo) {
      const rand = Math.random().toString(36).substring(2, 5)
      setWorkspace({ ...workspace, cluster: 'pluraldemo', bucketPrefix: `plrlt-${rand}`})
    }
  }, [demo])

  return (
    <Box gap="small">
      <LabelledInput
        label="cluster"
        width="100%"
        placeholder="alphanumeric cluster name"
        value={workspace.cluster}
        onChange={value => setWorkspace({ ...workspace, cluster: value })}
      />
      <LabelledInput
        label="bucket prefix"
        width="100%"
        placeholder="small unique string to deduplicate s3-like buckets"
        value={workspace.bucketPrefix}
        onChange={value => setWorkspace({ ...workspace, bucketPrefix: value })}
      />
      <SuffixedInput
        value={workspace.subdomain}
        placeholder="subdomain"
        suffix=".onplural.sh"
        background="card"
        onChange={val => setWorkspace({ ...workspace, subdomain: val })}
      />
    </Box>
  )
}
