import { useEffect, useState } from "react";

type User = {
    id: string;
    name: string;
    email: string;
    joinedDate: string;
    provider: string; // e.g., 'Google', 'GitHub', 'Email'
};

const fetchUsers = async (): Promise<User[]> => {
    // Replace with your actual API call
    return [
        {
            id: "1",
            name: "Alice",
            email: "alice@example.com",
            joinedDate: "2024-05-01",
            provider: "Google",
        },
        {
            id: "2",
            name: "Bob",
            email: "bob@example.com",
            joinedDate: "2024-05-10",
            provider: "Email",
        },
    ];
};

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers().then((data) => {
            setUsers(data);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <h1>Manage Users</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
                            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Email</th>
                            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Joined Date</th>
                            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Logged In Through</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.name}</td>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.email}</td>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.joinedDate}</td>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{user.provider}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}