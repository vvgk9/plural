import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { Scroller, Copyable, ModalHeader, Button, SecondaryButton } from 'forge-core'
import { extendConnection } from '../../utils/graphql'
import { Box, Layer, Text, TextInput } from 'grommet'
import { WebhookLog } from './WebhookLog'
import { useMutation, useQuery } from 'react-apollo'
import { DELETE_WEBHOOK, UPDATE_WEBHOOK, WEBHOOK_Q } from './queries'
import { ActionInput, ActionTab } from './CreateWebhook'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { Close, Edit, Refresh, Trash } from 'grommet-icons'

export function Container({title, children, modifier, ...props}) {
  return (
    <Box {...props} border={{color: 'light-4'}}>
      <Box flex={false} fill='horizontal' background='light-2' border={{side: 'bottom', color: 'light-4'}}
        pad={{horizontal: 'small', vertical: 'xsmall'}} align='center' direction='row'>
        <Box  fill='horizontal' >
          <Text size='small' weight={500}>{title}</Text>
        </Box>
        {modifier}
      </Box>
      <Box fill>
        {children}
      </Box>
    </Box>
  )
}

function NoLogs() {
  return (
    <Box pad='small'>
      <Text size='small'><i>No webhooks delivered yet...</i></Text>
    </Box>
  )
}

function WebhookLogs({webhook: {logs: {pageInfo, edges}}, fetchMore, refetch}) {
  return (
    <Container title='webhook logs' 
      modifier={<Control icon={<Refresh size='small' />} onClick={() => refetch()} />}>
      <Scroller
        id='webhooklogs'
        style={{width: '100%', height: '100%', overflow: 'auto'}}
        edges={edges}
        emptyState={<NoLogs />}
        mapper={({node}, next) => <WebhookLog key={node.id} log={node} next={next.node} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {integrationWebhook: {logs}}}) => ({
            ...prev, integrationWebhook: extendConnection(prev.integrationWebhook, logs, 'logs')
          })
        })} />
    </Container>
  )
}

export function Attribute({name, children}) {
  return (
    <Box direction='row' align='center' fill='horizontal' pad='small'>
      <Box width='80px' >
        <Text size='small' weight='bold'>{name}</Text>
      </Box>
      <Box fill='horizontal'>
        {children}
      </Box>
    </Box>
  )
}

function Attributes({children}) {
  return (
    <Box border={{color: 'light-5'}} round='xsmall'>
      <Box gap='0px' border={{side: 'between', color: 'light-5'}}>
        {children}
      </Box>
    </Box>
  )
}

function WebhookHeader({webhook, setEdit}) {
  return (
    <Container flex={false} title={webhook.name} modifier={<WebhookControls webhook={webhook} setEdit={setEdit} />}>
      <Box flex={false} gap='small' pad='small'>
        <Attributes>
          <Attribute name='url'>
            <Text size='small'>{webhook.url}</Text>
          </Attribute>
          <Attribute name='secret'>
            <Copyable noBorder pillText='Copied webhook secret' text={webhook.secret}
              displayText={
                <Text size='small' color='dark-3'>({webhook.secret.substring(0, 9) + "x".repeat(15)})</Text>
              } />
          </Attribute>
          <Box flex={false} pad='small' direction='row' gap='xxsmall' align='center' wrap>
            {webhook.actions.map((action) => <ActionTab key={action} action={action} />)}
          </Box>
        </Attributes>
      </Box>
    </Container>
  )
}

function Control({icon, onClick}) {
  return (
    <Box flex={false} width='25px' height='25px' onClick={onClick} hoverIndicator='light-4' focusIndicator={false}
         align='center' justify='center' round='xsmall'>
      {icon}
    </Box>
  )
}

function WebhookControls({webhook, setEdit}) {
  let hist = useHistory()
  const [open, setOpen] = useState(false)
  const [mutation, {loading}] = useMutation(DELETE_WEBHOOK, {
    variables: {id: webhook.id},
    onCompleted: () => hist.push('/webhooks')
  })

  return (
    <>
    <Box flex={false} direction='row' align='center' gap='xsmall'>
      <Control icon={<Edit size='small' />} onClick={() => setEdit(true)} />
      <Control icon={<Trash size='small' />} onClick={() => setOpen(true)} />
    </Box>
    {open && (
      <Layer modal onClickOutside={() => setOpen(false)}>
        <Box width='40vw'>
          <ModalHeader text={`Delete ${webhook.name}?`} setOpen={setOpen} />
          <Box fill pad='small' gap='small'>
            <Text size='small'><i>Are you sure you want to delete {webhook.name}</i></Text>
            <Box direction='row' align='center' justify='end' gap='small'>
              <SecondaryButton label='Cancel' onClick={() => setOpen(false)} />
              <Button label='Delete' background='error' onClick={mutation} loading={loading} />
            </Box>
          </Box>
        </Box>
      </Layer>
    )}
    </>
  )
}

function EditWebhook({webhook, setEdit}) {
  const [attributes, setAttributes] = useState({name: webhook.name, url: webhook.url, actions: webhook.actions})
  const [mutation, {loading}] = useMutation(UPDATE_WEBHOOK, {
    variables: {id: webhook.id, attributes},
    onCompleted: () => setEdit(false)
  })

  return (
    <Box flex={false} border={{color: 'light-4'}}>
      <Box flex={false} fill='horizontal' background='light-2' border={{side: 'bottom', color: 'light-4'}}
        pad={{horizontal: 'small', vertical: 'xsmall'}} align='center' direction='row' gap='small'>
        <Box fill='horizontal'>
          <Box flex={false} background='white'>
            <TextInput
              value={attributes.name} 
              onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
          </Box>
        </Box>
        <Box flex={false} direction='row' gap='xsmall' align='center'>
          <Button label='update' loading={loading} onClick={mutation} />
          <Control icon={<Close size='small' />} onClick={() => setEdit(false)} />
        </Box>
      </Box>
      <Box fill pad='small' gap='xsmall'>
        <TextInput 
          placeholder='url to deliver to' 
          value={attributes.url} 
          onChange={({target: {value}}) => setAttributes({...attributes, url: value})} />
        <ActionInput actions={attributes.actions} setActions={(actions) => setAttributes({...attributes, actions})} />
      </Box>
    </Box>
  )
}

export function Webhook() {
  const [edit, setEdit] = useState(false)
  const {id} = useParams()
  const {data, fetchMore, refetch} = useQuery(WEBHOOK_Q, {variables: {id}, fetchPolicy: 'cache-and-network'})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{url: `/webhooks`, text: 'webhooks'}, {url: `/webhooks/${id}`, text: id}])
  }, [setBreadcrumbs, id])

  if (!data) return null

  const {integrationWebhook: webhook} = data

  return (
    <Box fill pad='small' gap='small'>
      {!edit && <WebhookHeader webhook={webhook} setEdit={setEdit} />}
      {edit && <EditWebhook webhook={webhook} setEdit={setEdit} />}
      <WebhookLogs webhook={webhook} fetchMore={fetchMore} refetch={refetch} />
    </Box>
  )
}