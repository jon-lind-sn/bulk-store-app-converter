import { Property } from '@servicenow/sdk/core'

Property({
    $id: Now.ID['bulk-convert-store-app-publish-log'],
    name: 'bulk_convert_store_app.publish_log',
    value: '{}',
    type: 'string',
    description:
        'JSON map of app scope to the last time the Bulk App Clone Assistant published it. Used as a fallback to detect work changed after publish.',
    ignoreCache: true,
    roles: {
        read: ['admin'],
        write: ['admin'],
    },
})
