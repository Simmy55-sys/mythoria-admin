"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Plus,
  Search,
  Power,
  PowerOff,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  LinkIcon,
  Loader2,
  LogOut,
} from "lucide-react";
import { adminApi, type Translator, type NovelSeries } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "translators" | "series" | "assign" | "create-novel"
  >("translators");
  const [showAddTranslator, setShowAddTranslator] = useState(false);
  const [showCreateNovel, setShowCreateNovel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [newTranslator, setNewTranslator] = useState({
    username: "",
    email: "",
  });
  const [newNovel, setNewNovel] = useState({
    seriesName: "",
    translatorId: "",
    adminRating: 3,
  });
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [translatorPassword, setTranslatorPassword] = useState<string | null>(
    null
  );
  const [categories, setCategories] = useState<string[]>([]);

  const [translators, setTranslators] = useState<Translator[]>([]);
  const [series, setSeries] = useState<NovelSeries[]>([]);

  // Load data on mount and when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (
        activeTab === "translators" ||
        activeTab === "assign" ||
        activeTab === "create-novel"
      ) {
        const translatorsData = await adminApi.getTranslators();
        setTranslators((translatorsData as any).data);
      }
      if (activeTab === "series" || activeTab === "assign") {
        const seriesData = await adminApi.getSeries();
        setSeries((seriesData as any).data);
      }
      if (activeTab === "create-novel") {
        const categoriesData = await adminApi.getCategories();
        setCategories((categoriesData as any).data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTranslatorStatus = async (id: string) => {
    try {
      await adminApi.toggleTranslatorStatus(id);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update translator status"
      );
    }
  };

  const addTranslator = async () => {
    if (!newTranslator.username || !newTranslator.email) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setError(null);
      const result = await adminApi.createTranslator(newTranslator);
      // Extract password from response (response is wrapped in { success, data })
      const response = result as any;
      const password = response.data?.password || response.password;
      if (password) {
        setTranslatorPassword(password);
      }
      setNewTranslator({ username: "", email: "" });
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create translator"
      );
    }
  };

  const deleteTranslator = async (id: string) => {
    if (!confirm("Are you sure you want to delete this translator?")) {
      return;
    }
    try {
      setError(null);
      await adminApi.deleteTranslator(id);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete translator"
      );
    }
  };

  const deleteSeries = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone and will delete all associated chapters, comments, and ratings.`
      )
    ) {
      return;
    }
    try {
      setError(null);
      await adminApi.deleteSeries(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete series");
    }
  };

  const createNovel = async () => {
    if (!newNovel.seriesName || !newNovel.translatorId) {
      setError("Please fill in all required fields");
      return;
    }
    try {
      setError(null);
      const result = await adminApi.assignSeries({
        translatorId: newNovel.translatorId,
        seriesName: newNovel.seriesName,
        adminRating: newNovel.adminRating,
      });
      // Extract assignmentId from response (response is wrapped in { success, data })
      const response = result as any;
      const assignmentIdValue =
        response.data?.assignmentId || response.assignmentId;
      if (assignmentIdValue) {
        setAssignmentId(assignmentIdValue);
      }
      setNewNovel({ seriesName: "", translatorId: "", adminRating: 3 });
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create novel assignment"
      );
    }
  };

  const filteredTranslators = translators.filter(
    (t) =>
      t.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSeries = series.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage translators and novel series
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      setLoggingOut(true);
                      await logout();
                    }}
                    disabled={loggingOut}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              )}
              <div className="flex gap-4">
                <Card className="px-6 py-4 bg-primary/10 border-primary/20">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {translators.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Translators
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="px-6 py-4 bg-secondary/10 border-secondary/20">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-secondary" />
                    <div>
                      <div className="text-2xl font-bold text-secondary">
                        {series.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Novel Series
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-8">
            <Button
              variant={activeTab === "translators" ? "default" : "ghost"}
              onClick={() => setActiveTab("translators")}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Translators
            </Button>
            <Button
              variant={activeTab === "series" ? "default" : "ghost"}
              onClick={() => setActiveTab("series")}
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Novel Series
            </Button>
            <Button
              variant={activeTab === "assign" ? "default" : "ghost"}
              onClick={() => setActiveTab("assign")}
              className="gap-2"
            >
              <LinkIcon className="w-4 h-4" />
              Assign Series
            </Button>
            <Button
              variant={activeTab === "create-novel" ? "default" : "ghost"}
              onClick={() => setActiveTab("create-novel")}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Novel
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Card className="p-4 mb-6 border-destructive bg-destructive/10">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        )}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {/* Translators Tab */}
        {activeTab === "translators" && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search translators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setShowAddTranslator(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Translator
              </Button>
            </div>

            {/* Add Translator Form */}
            {showAddTranslator && (
              <Card className="p-6 border-primary/30 bg-card/80 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4">
                  Register New Translator
                </h3>

                {translatorPassword && (
                  <Card className="p-4 mb-6 border-green-500/30 bg-green-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-green-400">
                        Translator Created Successfully!
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Generated Password (share this with the translator):
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-2 bg-background border border-border rounded text-sm font-mono">
                        {translatorPassword}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(translatorPassword);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setTranslatorPassword(null);
                        setShowAddTranslator(false);
                      }}
                    >
                      Create Another
                    </Button>
                  </Card>
                )}

                {!translatorPassword && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">
                          Username
                        </label>
                        <Input
                          placeholder="Enter username"
                          value={newTranslator.username}
                          onChange={(e) =>
                            setNewTranslator({
                              ...newTranslator,
                              username: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">
                          Email
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter email"
                          value={newTranslator.email}
                          onChange={(e) =>
                            setNewTranslator({
                              ...newTranslator,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={addTranslator}>Add Translator</Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setTranslatorPassword(null);
                          setShowAddTranslator(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* Translators List */}
            <div className="grid gap-4">
              {filteredTranslators.map((translator) => (
                <Card
                  key={translator.id}
                  className="p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {translator.username}
                          </h3>
                          {translator.status === "active" ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="bg-destructive/20 border-destructive/30"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Suspended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {translator.email}
                        </p>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Assigned Series:{" "}
                            </span>
                            <span className="text-primary font-semibold">
                              {translator.assignedSeries}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Chapters Translated:{" "}
                            </span>
                            <span className="text-secondary font-semibold">
                              {translator.chaptersTranslated}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Joined:{" "}
                            </span>
                            <span className="text-foreground">
                              {translator.joinedDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          translator.status === "active"
                            ? "destructive"
                            : "default"
                        }
                        onClick={() => toggleTranslatorStatus(translator.id)}
                        className="gap-2"
                      >
                        {translator.status === "active" ? (
                          <>
                            <PowerOff className="w-4 h-4" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deleteTranslator(translator.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Series Tab */}
        {activeTab === "series" && !loading && (
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search novel series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSeries.map((novel) => (
                <Card
                  key={novel.id}
                  className="overflow-hidden group hover:border-primary/30 transition-colors"
                >
                  <div className="aspect-3/4 relative overflow-hidden">
                    <img
                      src={novel.cover || "/placeholder.svg"}
                      alt={novel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={
                          novel.status === "ongoing"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : novel.status === "completed"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }
                      >
                        {novel.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                        {novel.title}
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                        onClick={() => deleteSeries(novel.id, novel.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {novel.categories.map((cat) => (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Chapters:</span>
                      <span className="font-semibold text-primary">
                        {novel.totalChapters}
                      </span>
                    </div>
                    {novel.translator ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Translator:
                        </span>
                        <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                          {novel.translator}
                        </Badge>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        No translator assigned
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Assign Tab */}
        {activeTab === "assign" && !loading && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                View Series Assignments
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                View all series and their assigned translators.
              </p>

              <div className="space-y-4">
                {series.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No series found
                  </p>
                ) : (
                  series.map((novel) => (
                    <Card key={novel.id} className="p-4 border-border/50">
                      <div className="flex items-center gap-4">
                        <img
                          src={novel.cover || "/placeholder.svg"}
                          alt={novel.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{novel.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{novel.totalChapters} chapters</span>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              {novel.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {novel.translator ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              {novel.translator}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              No translator assigned
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteSeries(novel.id, novel.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Create Novel Tab */}
        {activeTab === "create-novel" && !loading && (
          <div className="space-y-6">
            <Card className="p-6 border-primary/30 bg-card/80 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4">
                Create Novel and Assign to Translator
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create a new novel assignment. The translator will receive an
                assignment ID that they can use to create their series.
              </p>

              {assignmentId && (
                <Card className="p-4 mb-6 border-green-500/30 bg-green-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-green-400">
                      Assignment Created Successfully!
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Assignment ID (give this to the translator):
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-2 bg-background border border-border rounded text-sm font-mono">
                      {assignmentId}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(assignmentId);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setAssignmentId(null);
                      setShowCreateNovel(false);
                    }}
                  >
                    Create Another
                  </Button>
                </Card>
              )}

              {!assignmentId && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Novel Title <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Enter novel title"
                      value={newNovel.seriesName}
                      onChange={(e) =>
                        setNewNovel({
                          ...newNovel,
                          seriesName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Translator <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={newNovel.translatorId}
                      onChange={(e) =>
                        setNewNovel({
                          ...newNovel,
                          translatorId: e.target.value,
                        })
                      }
                      className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select a translator</option>
                      {translators
                        .filter((t) => t.status === "active")
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.username} ({t.email})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Admin Rating (Optional)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      placeholder="Rating (1-5)"
                      value={newNovel.adminRating}
                      onChange={(e) =>
                        setNewNovel({
                          ...newNovel,
                          adminRating: parseInt(e.target.value) || 3,
                        })
                      }
                    />
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button onClick={createNovel}>Create Assignment</Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setNewNovel({
                          seriesName: "",
                          translatorId: "",
                          adminRating: 3,
                        });
                        setShowCreateNovel(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
