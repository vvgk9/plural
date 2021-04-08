import React, { useContext, useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { Loading, Scroller } from 'forge-core'
import { QUEUE, UPGRADE_SUB } from './queries'
import { appendConnection, extendConnection } from '../../utils/graphql'
import { Box, Text } from 'grommet'
import { RepoIcon } from '../repos/Repositories'
import moment from 'moment'
import { BeatLoader } from 'react-spinners'
import { Github, Refresh } from 'grommet-icons'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { Attributes } from '../incidents/utils'
import { Attribute, Container } from '../integrations/Webhook'
import { Provider } from '../repos/misc'
import { useParams } from 'react-router'

function DeliveryProgress({delivered}) {
  return (
    <Box flex={false} pad={{horizontal: 'small', vertical: 'xsmall'}} background={delivered ? 'success' : 'progress'}
        direction='row' gap='small' round='xsmall'>
      {!delivered && <BeatLoader size={5} margin={2} color='white' />}
      <Text size='small'>{delivered ? 'delivered' : 'pending'}</Text>
    </Box>
  )
}

function Upgrade({upgrade, acked}) {
  return (
    <Box direction='row' align='center' pad='small' round='xsmall' gap='small' border={{color: 'light-5', side: 'bottom'}}>
      <RepoIcon repo={upgrade.repository} />
      <Box fill='horizontal'>
        <Box direction='row' gap='small' align='center'>
          <Text size='small' weight={500}>{upgrade.repository.name}</Text>
          <Text size='xsmall' color='dark-3'>{moment(upgrade.insertedAt).format('lll')}</Text>
        </Box>
        <Text size='small'><i>{upgrade.message}</i></Text>
      </Box>
      <DeliveryProgress delivered={acked && upgrade.id <= acked} />
    </Box>
  )
}

export function UpgradeQueue() {
  const {id} = useParams()
  const {data, fetchMore, subscribeToMore, refetch} = useQuery(QUEUE, {
    variables: {id},
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => subscribeToMore({
    document: UPGRADE_SUB,
    variables: {id},
    updateQuery: ({upgradeQueue, ...rest}, {subscriptionData: {data: {upgrade}}}) => {
      return {...rest, upgradeQueue: appendConnection(upgradeQueue, upgrade, 'upgrades')}
    }
  }), [])

  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([
      {url: `/upgrades`, text: 'upgrades'},
      {url: `/upgrades/${id}`, text: id},
    ])
  }, [setBreadcrumbs, id])

  if (!data) return <Loading />

  const queue = data.upgradeQueue
  const {upgrades: {edges, pageInfo}, acked} = queue

  return (
    <Box fill gap='small' pad='small'>
      <Container title={queue.name || 'default'} flex={false}>
        <Box direction='row' gap='small' align='center' pad='small'>
          <Provider provider={queue.provider} width={60} />
          <Box fill='horizontal' gap='xsmall'>
            <Attributes fill='horizontal'>
              <Attribute name='domain'>
                <Text size='small'>{queue.domain}</Text>
              </Attribute>
              <Attribute name='git url'>
                <Text size='small'><Github size='small' plain /> {queue.git}</Text>
              </Attribute>
            </Attributes>
          </Box>
        </Box>
      </Container>
      <Container fill title='upgrades' modifier={<Box flex={false} pad='xsmall' round='xsmall' onClick={() => refetch()} hoverIndicator='light-3' focusIndicator={false}>
          <Refresh size='small' />
        </Box>}>
        <Scroller 
          id='webhooks'
          style={{width: '100%', height: '100%', overflow: 'auto'}}
          edges={edges}
          mapper={({node}) => <Upgrade key={node.id} upgrade={node} acked={acked} />}
          onLoadMore={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {upgradeQueue: {upgrades}}}) => ({
              ...prev, upgradeQueue: extendConnection(prev.upgradeQueue, upgrades, 'upgrades')
            })
          })}
        />
      </Container>
    </Box>
  )
}