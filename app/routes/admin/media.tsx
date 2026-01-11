import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";

export default function AdminMedia() {
    const [assets, setAssets] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [currentPrefix, setCurrentPrefix] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [folder, setFolder] = useState("");
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<"date" | "type" | "name">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [searchQuery, setSearchQuery] = useState("");
    const [renameId, setRenameId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [previewAsset, setPreviewAsset] = useState<any | null>(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 12;

    async function loadAssets(prefix = "") {
        const res = await fetch(`/api/media?prefix=${prefix}`);
        const data = await res.json();
        setAssets(data.assets || []);
        setFolders(data.folders || []);
        setCurrentPrefix(prefix);
        setPage(1);
        setSelectedAssets([]);
    }

    useEffect(() => {
        loadAssets();
    }, []);

    async function handleUpload() {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder || currentPrefix);
        formData.append("_action", "upload");

        const res = await fetch("/api/media", { method: "POST", body: formData });
        const data = await res.json();
        if (data.asset) {
            setAssets([data.asset, ...assets]);
            setFile(null);
        }
    }

    async function handleDelete(public_id: string) {
        const formData = new FormData();
        formData.append("_action", "delete");
        formData.append("public_id", public_id);
        await fetch("/api/media", { method: "POST", body: formData });
        setAssets(assets.filter(a => a.public_id !== public_id));
        setSelectedAssets(selectedAssets.filter(id => id !== public_id));
    }

    async function handleBulkDelete() {
        const formData = new FormData();
        formData.append("_action", "bulk_delete");
        formData.append("public_ids", JSON.stringify(selectedAssets));
        await fetch("/api/media", { method: "POST", body: formData });
        setAssets(assets.filter(a => !selectedAssets.includes(a.public_id)));
        setSelectedAssets([]);
    }

    async function handleRename(public_id: string) {
        if (!newName) return;
        const formData = new FormData();
        formData.append("_action", "rename");
        formData.append("public_id", public_id);
        formData.append("new_name", newName);
        const res = await fetch("/api/media", { method: "POST", body: formData });
        const data = await res.json();
        if (data.asset) {
            setAssets(assets.map(a => a.public_id === public_id ? data.asset : a));
            setRenameId(null);
            setNewName("");
        }
    }

    const toggleSelect = (public_id: string) => {
        setSelectedAssets(prev =>
            prev.includes(public_id)
                ? prev.filter(id => id !== public_id)
                : [...prev, public_id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedAssets.length === paginatedAssets.length) {
            setSelectedAssets([]);
        } else {
            setSelectedAssets(paginatedAssets.map(asset => asset.public_id));
        }
    };

    const sortedAssets = [...assets]
        .filter(asset => asset.public_id.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "date") {
                return sortOrder === "asc"
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortBy === "type") {
                return sortOrder === "asc"
                    ? a.format.localeCompare(b.format)
                    : b.format.localeCompare(a.format);
            } else {
                return sortOrder === "asc"
                    ? a.public_id.localeCompare(b.public_id)
                    : b.public_id.localeCompare(a.public_id);
            }
        });

    const paginatedAssets = sortedAssets.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);

    return (
        <div className="container mx-auto p-4">
            <Card className="border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-900 dark:text-zinc-100">Media Manager</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                            />
                            <Input
                                type="text"
                                placeholder="Folder name"
                                value={folder}
                                onChange={(e) => setFolder(e.target.value)}
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                            />
                            <Button className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                                Upload
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
                            />
                            <Select
                                value={sortBy}
                                onValueChange={(value) => setSortBy(value as "date" | "type" | "name")}
                            >
                                <SelectTrigger className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
                                    <SelectItem value="date">Sort by Date</SelectItem>
                                    <SelectItem value="type">Sort by Type</SelectItem>
                                    <SelectItem value="name">Sort by Name</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                variant="outline"
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-zinc-100 dark:bg-zinc-900"
                            >
                                {sortOrder === "asc" ? "â†‘ Asc" : "â†“ Desc"}
                            </Button>
                            <Button
                                onClick={toggleSelectAll}
                                variant="outline"
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-zinc-100 dark:bg-zinc-900"
                            >
                                {selectedAssets.length === paginatedAssets.length ? "Deselect All" : "Select All"}
                            </Button>
                            {selectedAssets.length > 0 && (
                                <Button
                                    onClick={handleBulkDelete}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete Selected ({selectedAssets.length})
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {currentPrefix && (
                                <Button
                                    onClick={() => loadAssets("")}
                                    variant="outline"
                                    className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    â† Back
                                </Button>
                            )}
                            {folders.map((f) => (
                                <Button
                                    key={f.path}
                                    onClick={() => loadAssets(f.path)}
                                    variant="outline"
                                    className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    {f.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {paginatedAssets.map((asset) => (
                            <Card key={asset.public_id} className="border border-zinc-300 dark:border-zinc-700 relative">
                                <CardContent className="p-2">
                                    <Checkbox
                                        checked={selectedAssets.includes(asset.public_id)}
                                        onCheckedChange={() => toggleSelect(asset.public_id)}
                                        className="absolute top-2 left-2 border-zinc-300 dark:border-zinc-700"
                                    />
                                    <img
                                        src={asset.secure_url}
                                        alt={asset.public_id}
                                        className="w-full h-32 object-cover rounded cursor-pointer"
                                        onClick={() => setPreviewAsset(asset)}
                                    />
                                    {renameId === asset.public_id ? (
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="flex-1 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                                            />
                                            <Button
                                                onClick={() => handleRename(asset.public_id)}
                                                size="sm"
                                                className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={() => setRenameId(null)}
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-1">{asset.public_id}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    onClick={() => { setRenameId(asset.public_id); setNewName(asset.public_id); }}
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                >
                                                    Rename
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(asset.public_id)}
                                                    size="sm"
                                                    className="w-full bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                variant="outline"
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-50"
                            >
                                Previous
                            </Button>
                            <span className="text-zinc-600 dark:text-zinc-400">Page {page} of {totalPages}</span>
                            <Button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                variant="outline"
                                className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
                <DialogContent className="border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 max-w-3xl ">
                    <DialogHeader>
                        <DialogTitle>Preview</DialogTitle>
                    </DialogHeader>
                    <img
                        src={previewAsset?.secure_url}
                        alt={previewAsset?.public_id}
                        className="w-full h-auto max-h-[80vh] object-contain"
                    />
                    <p className="text-zinc-600 dark:text-zinc-400">{previewAsset?.public_id}</p>
                    <DialogFooter>
                        <Button
                            onClick={() => setPreviewAsset(null)}
                            variant="outline"
                            className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
