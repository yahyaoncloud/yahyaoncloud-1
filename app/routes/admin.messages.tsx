import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";
import { requireAdminUser } from "../utils/session.server";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/Card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Mail, Users, Clock, MessageSquare, Briefcase } from "lucide-react";

// Mock data - replace with actual data from your API
const clientMessageStats = {
    totalMessages: 180,
    pendingReplies: 15,
    activeClients: 42,
    avgResponseTime: 3.5,
};

const clientMessages = [
    { id: 1, client: "Acme Corp", contact: "sarah.jones@acme.com", subject: "Project Update", date: "2025-08-23", status: "Pending" },
    { id: 2, client: "Tech Solutions", contact: "mark.smith@techsol.com", subject: "Contract Renewal", date: "2025-08-22", status: "Replied" },
    { id: 3, client: "Global Inc", contact: "lisa.brown@globalinc.com", subject: "Service Inquiry", date: "2025-08-22", status: "Pending" },
    { id: 4, client: "Innovate LLC", contact: "david.wilson@innovate.com", subject: "Support Request", date: "2025-08-21", status: "Replied" },
    { id: 5, client: "Future Co", contact: "emma.taylor@futureco.com", subject: "Feedback", date: "2025-08-20", status: "Pending" },
];

export const loader: LoaderFunction = async ({ request }) => {
    await requireAdminUser(request);

    // In a real app, you would fetch actual data here
    return json({
        clientMessageStats,
        clientMessages,
    });
};

export default function AdminClientMessages() {
    const { clientMessageStats, clientMessages } = useLoaderData<typeof loader>();

    const StatCard = ({ title, value, icon: Icon, description }: {
        title: string;
        value: number | string;
        icon: React.ComponentType<any>;
        description?: string;
    }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Client Messages</h1>
                <p className="text-muted-foreground">Manage communications with clients</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Messages"
                    value={clientMessageStats.totalMessages}
                    icon={MessageSquare}
                    description="All client communications"
                />
                <StatCard
                    title="Pending Replies"
                    value={clientMessageStats.pendingReplies}
                    icon={Mail}
                    description="Messages awaiting response"
                />
                <StatCard
                    title="Active Clients"
                    value={clientMessageStats.activeClients}
                    icon={Users}
                    description="Clients with recent activity"
                />
                <StatCard
                    title="Avg. Response Time"
                    value={`${clientMessageStats.avgResponseTime}h`}
                    icon={Clock}
                    description="Average reply time"
                />
            </div>

            {/* Messages Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Client Messages</CardTitle>
                    <CardDescription>Latest communications from clients</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientMessages.map((message) => (
                                <TableRow key={message.id}>
                                    <TableCell className="font-medium">{message.client}</TableCell>
                                    <TableCell>{message.contact}</TableCell>
                                    <TableCell>{message.subject}</TableCell>
                                    <TableCell>{message.date}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-full ${message.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {message.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Client Details and Actions */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Message Details</CardTitle>
                        <CardDescription>View and manage selected client message</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">From: {clientMessages[0].client}</p>
                                <p className="text-sm text-muted-foreground">Contact: {clientMessages[0].contact}</p>
                                <p className="text-sm text-muted-foreground">Subject: {clientMessages[0].subject}</p>
                                <p className="text-sm text-muted-foreground">Date: {clientMessages[0].date}</p>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-sm">
                                    Dear Team, we have some updates regarding the ongoing project. Please review the attached specifications and provide feedback by EOD.
                                </p>
                            </div>
                            <div className="flex space-x-4">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                                    Reply
                                </button>
                                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">
                                    Mark as Replied
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                        <CardDescription>Details of the selected client</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: 'Client Name', value: clientMessages[0].client },
                                { label: 'Industry', value: 'Technology' },
                                { label: 'Last Contacted', value: '2025-08-23' },
                                { label: 'Account Status', value: 'Active', status: 'Active' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.label}</p>
                                        <p className="text-sm text-muted-foreground">{item.value}</p>
                                    </div>
                                    {item.status && (
                                        <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                            {item.status}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}