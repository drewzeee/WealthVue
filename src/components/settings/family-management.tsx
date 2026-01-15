'use client'

import { useState, useEffect } from 'react'
import { Check, X, Unlink, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Invite {
    id: string
    fromUser?: { name: string, email: string }
    toUser?: { name: string, email: string }
    toEmail: string
    status: string
    createdAt: string
}

export function FamilyManagement() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [invites, setInvites] = useState<{ sent: Invite[], received: Invite[] }>({ sent: [], received: [] })
    const [linkStatus, setLinkStatus] = useState<'NONE' | 'PENDING' | 'LINKED'>('NONE')
    const [linkedUser, setLinkedUser] = useState<{ name: string, email: string } | null>(null)

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/family/invites')
            const data = await res.json()
            if (data.success) {
                setInvites(data.invites)
            }

            // We should probably have a dedicated status endpoint, but let's use session or a quick fetch
            const userRes = await fetch('/api/user/status') // I might need to create this or use session
            const userData = await userRes.json()
            if (userData.success) {
                setLinkStatus(userData.linkStatus)
                setLinkedUser(userData.linkedUser)
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const sendInvite = async () => {
        if (!email) return
        setLoading(true)
        try {
            const res = await fetch('/api/family/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Invitation sent!')
                setEmail('')
                fetchStatus()
            } else {
                toast.error(data.error)
            }
        } catch (err) {
            toast.error('Failed to send invitation')
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: string, action: 'accept' | 'decline') => {
        try {
            const res = await fetch(`/api/family/invites/${id}/${action}`, {
                method: 'POST',
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Invitation ${action}ed`)
                fetchStatus()
            } else {
                toast.error(data.error)
            }
        } catch (err) {
            toast.error(`Failed to ${action} invitation`)
        }
    }

    const handleUnlink = async () => {
        if (!confirm('Are you sure you want to unlink? You will no longer see household data.')) return
        try {
            const res = await fetch('/api/family/unlink', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                toast.success('Accounts unlinked')
                fetchStatus()
            }
        } catch (err) {
            toast.error('Failed to unlink')
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Family Account Linking</CardTitle>
                    <CardDescription>
                        Link your account with a family member to see a combined household net worth and shared budgets.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {linkStatus === 'LINKED' ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-muted/50 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Check className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">Linked with {linkedUser?.name}</p>
                                    <p className="text-sm text-muted-foreground">{linkedUser?.email}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleUnlink}>
                                <Unlink className="h-4 w-4 mr-2" />
                                Unlink
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                placeholder="Spouse or family member email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={sendInvite} disabled={loading} className="w-full sm:w-auto">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                Invite
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {invites.received.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Received Invitations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {invites.received.map(invite => (
                            <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{invite.fromUser?.name}</p>
                                    <p className="text-xs text-muted-foreground">{invite.fromUser?.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleAction(invite.id, 'accept')}>
                                        Accept
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleAction(invite.id, 'decline')}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {invites.sent.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sent Invitations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {invites.sent.map(invite => (
                            <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{invite.toEmail}</p>
                                    <Badge variant="secondary">Pending</Badge>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleAction(invite.id, 'decline')}>
                                    Cancel
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
