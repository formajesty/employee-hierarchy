"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPositions, Position } from "@/store/positionSlice";
import { RootState, AppDispatch } from "@/store/store";
import { Tree, useTree, TreeNodeData, Group, Text, Paper, ThemeIcon, Box, Input, Button, Badge, Tooltip } from "@mantine/core";
import { 
  IconHierarchy2, IconChevronRight, IconBriefcase, IconSearch, IconPlus, 
  IconLayoutDashboard, IconTrendingUp, IconAlertCircle 
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";

function transformToTreeData(flatList: Position[], searchQuery: string): TreeNodeData[] {
  const map: Record<string, TreeNodeData & { children: TreeNodeData[] }> = {};
  const roots: TreeNodeData[] = [];

  const matchesSearch = (name: string) => 
    name.toLowerCase().includes(searchQuery.toLowerCase());

  flatList.forEach((item) => {
    map[item.id] = {
      value: item.id,
      label: item.name,
      children: [],
    };
  });

  flatList.forEach((item) => {
    const node = map[item.id];
    const parentId = item.parent?.id || item.parentId;

    if (parentId && map[parentId]) {
      map[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  if (!searchQuery) return roots;

  const filterTree = (nodes: TreeNodeData[]): TreeNodeData[] => {
    return nodes
      .map(node => ({ ...node, children: filterTree(node.children || []) }))
      .filter(node => matchesSearch(node.label as string) || node.children.length > 0);
  };

  return filterTree(roots);
}

export default function Home() {
  const tree = useTree();
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState("");

  const { positions, loading, error } = useSelector(
    (state: RootState) => state.position
  ) as { positions: Position[]; loading: { positions: boolean }; error: { positions: string | null } };

  useEffect(() => {
    dispatch(fetchPositions());
  }, [dispatch]);

  const metrics = useMemo(() => {
    if (!positions) return { total: 0, leadership: 0, departments: 0 };
    const total = positions.length;
    const leadership = positions.filter(p => !p.parent && !p.parentId).length;
    return {
      total,
      leadership,
      departments: Math.max(1, Math.ceil(total / 4)), 
    };
  }, [positions]);

  const treeData = useMemo(() => {
    if (!positions || positions.length === 0) return [];
    return transformToTreeData(positions, searchQuery);
  }, [positions, searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      
      {/* Primary Layout Canvas */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-6xl mx-auto w-full">
        
        {/* Upper Title Header Panel Area */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Organization Index</h1>
            <p className="text-slate-600 dark:text-zinc-400 text-sm font-medium mt-1">Audit reporting dependencies, operational tree paths, and functional roles.</p>
          </div>
          <Link href="/position/new" passHref legacyBehavior>
            <Button 
              component="a"
              leftSection={<IconPlus size={16} stroke={2.5} />}
              className="bg-blue-600 hover:bg-blue-500 rounded-xl px-5 h-11 font-semibold transition-all shadow-lg shadow-blue-500/10 self-start sm:self-auto"
            >
              Add Position
            </Button>
          </Link>
        </div>

        {/* Live Context Metrics Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <Paper withBorder radius="xl" p="xl" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" fw={700} className="tracking-wider uppercase">Total Indexed Roles</Text>
              <IconBriefcase size={20} className="text-blue-500" />
            </Group>
            <Group align="flex-end" gap="xs">
              <Text size="28px" fw={800} className="text-slate-950 dark:text-white line-height-1">{metrics.total}</Text>
              <Badge variant="light" color="blue" radius="md" size="sm" leftSection={<IconTrendingUp size={12} />}>Live</Badge>
            </Group>
          </Paper>

          <Paper withBorder radius="xl" p="xl" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" fw={700} className="tracking-wider uppercase">Executive Roots</Text>
              <IconHierarchy2 size={20} className="text-indigo-500" />
            </Group>
            <Text size="28px" fw={800} className="text-slate-950 dark:text-white line-height-1">{metrics.leadership}</Text>
          </Paper>

          <Paper withBorder radius="xl" p="xl" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm">
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed" fw={700} className="tracking-wider uppercase">Department Segments</Text>
              <IconLayoutDashboard size={20} className="text-emerald-500" />
            </Group>
            <Text size="28px" fw={800} className="text-slate-950 dark:text-white line-height-1">{metrics.departments}</Text>
          </Paper>
        </div>

        {/* Action Interface Bar */}
        <div className="mb-6">
          <Input
            placeholder="Search indexing track by title name..."
            leftSection={<IconSearch size={16} className="text-slate-500 dark:text-zinc-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            radius="xl"
            size="md"
            className="max-w-md shadow-sm"
            styles={{
              input: {
                backgroundColor: "var(--mantine-color-body)",
                borderColor: "rgb(226, 232, 240)",
                color: "var(--mantine-color-text)",
                fontWeight: 500,
              }
            }}
          />
        </div>

        {/* Tree Canvas Rendering Base Block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper withBorder radius="2xl" p="xl" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm min-h-[400px] flex flex-col">
            {loading.positions ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-3" />
                <Text size="sm" c="dimmed" fw={500}>Compiling organizational graph tree records...</Text>
              </div>
            ) : error.positions ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
                <ThemeIcon size="xl" radius="xl" color="red" variant="light" mb="md">
                  <IconAlertCircle size={24} />
                </ThemeIcon>
                <Text fw={700} size="sm" className="text-slate-950 dark:text-white">Failed to stream records</Text>
                <Text size="xs" c="dimmed" mt={4} fw={500}>{error.positions}</Text>
              </div>
            ) : treeData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
                <ThemeIcon size="xl" radius="xl" color="gray" variant="light" mb="md">
                  <IconSearch size={24} />
                </ThemeIcon>
                <Text fw={700} size="sm" className="text-slate-950 dark:text-white">No tracks matched criteria</Text>
                <Text size="xs" c="dimmed" mt={4} fw={500}>Try tailoring search terms or initialize clean data branches directly using the action utility button above.</Text>
              </div>
            ) : (
              <div className="py-2 space-y-1">
                <Tree
                  tree={tree}
                  data={treeData}
                  levelOffset={36}
                  renderNode={({ node, expanded, hasChildren, elementProps }) => (
                    /* Outer custom layout wrapper replacing Group for true block width control */
                    <div
                      {...elementProps}
                      className="flex items-center w-full rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-all duration-150 group pr-4 pl-2 py-1.5"
                    >
                      {/* Isolated Expand/Collapse Chevron Area */}
                      {hasChildren ? (
                        <button 
                          type="button"
                          className="p-1.5 mr-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition-colors duration-150 z-10"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents page navigation when hitting the arrow
                            tree.toggleExpanded(node.value);
                          }}
                        >
                          <IconChevronRight
                            size={16}
                            className="text-slate-500 dark:text-zinc-400 transition-transform duration-200 stroke-[2.5]"
                            style={{ transform: expanded ? "rotate(90deg)" : "none" }}
                          />
                        </button>
                      ) : (
                        <Box w={32} />
                      )}

                      {/* Full-width Link Portal Wrapper */}
                      <Tooltip label="Click anywhere on row to edit parameters" position="right" openDelay={600} radius="md" withArrow>
                        <Link
                          href={`/position/edit/${node.value}`}
                          className="flex-1 flex items-center gap-3 no-underline py-1 w-full"
                        >
                          <IconBriefcase
                            size={18}
                            className={hasChildren ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-zinc-400"}
                          />
                          {/* Deep contrast and bolded letter elements */}
                          <Text 
                            size="sm" 
                            className="font-semibold text-slate-950 dark:text-zinc-50 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150"
                          >
                            {node.label}
                          </Text>
                        </Link>
                      </Tooltip>
                    </div>
                  )}
                />
              </div>
            )}
          </Paper>
        </motion.div>
      </main>
    </div>
  );
}