import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Compass,
  ArrowRight,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth } from '../services/api';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function ResourcesPage() {
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resourcePayload, setResourcePayload] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getAuth('/resources');
      if (res.error) {
        setError(res.error);
        setResourcePayload(null);
      } else if (res.data) {
        setResourcePayload(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load curated resources.');
      setResourcePayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources, profile?.selectedCareerId]);

  // Extract list of unique skills from payload for filter dropdown
  const availableSkills = useMemo(() => {
    if (!resourcePayload?.milestonesWithResources) return [];
    return resourcePayload.milestonesWithResources.map((m) => m.skillName);
  }, [resourcePayload]);

  // Filter milestones and their resources
  const filteredMilestones = useMemo(() => {
    if (!resourcePayload?.milestonesWithResources) return [];

    return resourcePayload.milestonesWithResources
      .map((milestone) => {
        if (
          selectedSkill !== 'all' &&
          milestone.skillName.toLowerCase() !== selectedSkill.toLowerCase()
        ) {
          return null;
        }

        const filteredResources = milestone.resources.filter((res) => {
          if (selectedLevel !== 'all' && res.level !== selectedLevel) {
            return false;
          }
          if (selectedType !== 'all' && res.type !== selectedType) {
            return false;
          }
          if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            const matchesTitle = res.title.toLowerCase().includes(query);
            const matchesDesc = res.description.toLowerCase().includes(query);
            const matchesProvider = res.provider.toLowerCase().includes(query);
            const matchesTopic = res.topic.toLowerCase().includes(query);
            const matchesSkill = res.skillName.toLowerCase().includes(query);
            if (
              !matchesTitle &&
              !matchesDesc &&
              !matchesProvider &&
              !matchesTopic &&
              !matchesSkill
            ) {
              return false;
            }
          }
          return true;
        });

        if (filteredResources.length === 0) return null;

        return {
          ...milestone,
          resources: filteredResources,
        };
      })
      .filter(Boolean);
  }, [resourcePayload, selectedSkill, selectedLevel, selectedType, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return filteredMilestones.reduce((sum, m) => sum + m.resources.length, 0);
  }, [filteredMilestones]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSelectedType('all');
    setSelectedSkill('all');
  };

  return (
    <div className="py-8 sm:py-12 min-h-[75vh]">
      <Container size="narrow">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
                Curated Learning Resources
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Hand-picked, 100% free tutorials, documentation, and guides aligned with your priority roadmap.
              </p>
            </div>

            <Button to="/roadmap" variant="secondary" size="sm" className="self-start sm:self-auto text-xs">
              View Roadmap
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="p-10 text-center border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)] mx-auto" />
              <p className="text-sm font-semibold text-[var(--text-main)]">Loading resources...</p>
            </Card>
          )}

          {/* No Career Selected State */}
          {!loading && !profile?.selectedCareerId && (
            <Card className="p-8 text-center border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-4">
              <Compass className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
              <div className="space-y-1">
                <h2 className="text-base font-bold text-[var(--text-main)]">Target Career Required</h2>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Select a career goal to view resources curated for your benchmark requirements.
                </p>
              </div>
              <Button to="/career" variant="primary" size="sm">
                Choose Career Goal
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Card>
          )}

          {/* Active Resources View */}
          {!loading && resourcePayload && (
            <div className="space-y-6">
              {/* Compact Search & Filter Bar */}
              <Card className="p-4 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by topic, provider, or skill name..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
                  />
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Skill Dropdown */}
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
                  >
                    <option value="all">All Skills ({availableSkills.length})</option>
                    {availableSkills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>

                  {/* Level Dropdown */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>

                  {/* Type Dropdown */}
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-[var(--border-color)] text-[var(--text-main)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--focus-ring)]"
                  >
                    <option value="all">All Types</option>
                    <option value="documentation">Documentation</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="guide">Guide</option>
                    <option value="course">Course</option>
                  </select>

                  {/* Clear Button */}
                  {(searchQuery || selectedLevel !== 'all' || selectedType !== 'all' || selectedSkill !== 'all') && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-[var(--primary-color)] hover:underline ml-auto font-medium"
                    >
                      Reset filters
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-[var(--text-muted)] border-t border-[var(--border-color)]/60 pt-2 flex items-center justify-between">
                  <span>
                    Showing <strong>{totalFilteredCount}</strong> resources for {resourcePayload.careerName}
                  </span>
                  <span>100% Free &amp; Verified</span>
                </div>
              </Card>

              {/* Empty state */}
              {filteredMilestones.length === 0 && (
                <Card className="p-8 text-center border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs space-y-3">
                  <Filter className="w-6 h-6 text-[var(--text-muted)] mx-auto" />
                  <p className="text-sm font-semibold text-[var(--text-main)]">No matching resources</p>
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </Card>
              )}

              {/* Grouped by Priority Milestone */}
              <div className="space-y-6">
                {filteredMilestones.map((milestone) => (
                  <div key={milestone.skillName} className="space-y-3">
                    {/* Milestone Section Header */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                          #{milestone.milestoneOrder}
                        </span>
                        <h2 className="text-sm font-bold text-[var(--text-main)]">
                          {milestone.skillName}
                        </h2>
                        <Badge
                          variant={
                            milestone.gapClassification === 'High Gap'
                              ? 'warning'
                              : milestone.gapClassification === 'Medium Gap'
                              ? 'indigo'
                              : 'success'
                          }
                          className="text-[10px] py-0"
                        >
                          {milestone.gapClassification}
                        </Badge>
                      </div>

                      <span className="text-[11px] text-[var(--text-muted)]">
                        {milestone.resources.length} {milestone.resources.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Clean Resource Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {milestone.resources.map((res) => (
                        <Card
                          key={res.id}
                          className="p-4 border-[var(--border-color)] bg-[var(--surface-color)] shadow-xs hover:border-[var(--primary-color)]/40 transition-colors flex flex-col justify-between space-y-2.5"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <Badge variant="indigo" className="capitalize text-[9px] py-0 px-1.5">
                                {res.level}
                              </Badge>
                              <span className="text-[var(--text-muted)] font-medium">
                                {res.provider}
                              </span>
                            </div>

                            <h3 className="text-xs sm:text-sm font-bold text-[var(--text-main)] line-clamp-1">
                              {res.title}
                            </h3>

                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                              {res.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between">
                            <span className="text-[10px] text-[var(--text-muted)]">
                              Est. {res.estimatedTime}
                            </span>

                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[var(--primary-color)] text-white hover:opacity-90 transition-opacity"
                            >
                              Start Learning
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
