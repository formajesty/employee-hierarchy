"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { createPosition, fetchPositions } from "@/store/positionSlice";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Popover, InputBase, Tree, useTree, TreeNodeData, Box, Group, 
  Text, CloseButton 
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { 
  IconBriefcase, IconFileDescription, IconHierarchy2, 
  IconAlertCircle, IconPlus, IconChevronRight 
} from "@tabler/icons-react";

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Position name must be at least 3 characters")
    .required("Position name is required"),
  description: yup
    .string()
    .min(3, "Description must be at least 3 characters")
    .required("Description is required"),
  parentId: yup
    .string()
    .nullable()
    .default(null),
});

type FormValues = yup.InferType<typeof schema>;

interface PositionItem {
  id: string;
  name: string;
  parent: { id: string; name: string } | null;
}

function transformToTreeData(flatList: PositionItem[]): TreeNodeData[] {
  const map: Record<string, TreeNodeData & { children: TreeNodeData[] }> = {};
  const roots: TreeNodeData[] = [];

  flatList.forEach((item) => {
    map[item.id] = {
      value: item.id,
      label: item.name,
      children: [],
    };
  });

  flatList.forEach((item) => {
    const node = map[item.id];
    const parentId = item.parent?.id;

    if (parentId && map[parentId]) {
      map[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

const PositionForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dropdownTree = useTree();
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState<string>("");

  const { positions, loading } = useSelector(
    (state: RootState) => state.position
  ) as { 
    positions: PositionItem[]; 
    loading: { positions: boolean; create?: boolean } 
  };

  useEffect(() => {
    dispatch(fetchPositions());
  }, [dispatch]);

  const treeData = useMemo(() => {
    if (!positions || positions.length === 0) return [];
    return transformToTreeData(positions);
  }, [positions]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMessage(""); // Clear previous error

    try {
      await dispatch(createPosition({
        id: "", // The backend usually generates this, but the type requires it
        name: data.name,
        description: data.description,
        parentId: data.parentId
      })).unwrap();
      
      reset();
      router.push("/"); // Redirect after successful creation
    } catch (error: any) {
      console.error("Error creating position:", error);
      
      const message = 
        error?.message || 
        error?.payload?.message || 
        error?.error?.message || 
        error ||
        "Failed to create position. Please try again.";

      setErrorMessage(message);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md p-8 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl"
      >
        <div className="mb-8">
          <h2 className="text-2xl text-zinc-100 font-bold tracking-tight">Create Position</h2>
          <p className="text-zinc-400 text-sm mt-1">Add a new role to the organizational hierarchy.</p>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl flex items-start gap-3"
            >
              <IconAlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Creation Failed</p>
                <p className="text-sm mt-1">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Position Name */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5 ml-1">Position Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                <IconBriefcase size={18} />
              </div>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g. Lead Developer"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <AnimatePresence>
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"
                >
                  <IconAlertCircle size={12} /> {errors.name.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5 ml-1">Description</label>
            <div className="relative group">
              <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                <IconFileDescription size={18} />
              </div>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Briefly describe the responsibilities..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 resize-none"
              />
            </div>
            <AnimatePresence>
              {errors.description && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"
                >
                  <IconAlertCircle size={12} /> {errors.description.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Parent Position Selector */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-1.5 ml-1 flex justify-between items-center">
              <span>Reports To (Parent Position)</span>
              <span className="text-zinc-600 text-xs font-normal">Optional</span>
            </label>
            
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => {
                const selectedPosition = positions.find((p) => p.id === field.value);

                return (
                  <Popover
                    opened={dropdownOpened}
                    onChange={setDropdownOpened}
                    position="bottom"
                    width="target"
                    transitionProps={{ transition: "pop" }}
                    radius="lg"
                    shadow="md"
                  >
                    <Popover.Target>
                      <InputBase
                        component="button"
                        type="button"
                        pointer
                        disabled={loading.positions}
                        onClick={() => setDropdownOpened((o) => !o)}
                        leftSection={<IconHierarchy2 size={18} className="text-zinc-500" />}
                        rightSection={
                          field.value ? (
                            <CloseButton
                              size="sm"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                field.onChange(null);
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-4 h-4">
                              <IconChevronRight size={16} className="rotate-90 text-zinc-500" />
                            </div>
                          )
                        }
                        styles={{
                          input: {
                            backgroundColor: "rgba(9, 9, 11, 0.5)",
                            borderColor: "#27272a",
                            color: selectedPosition ? "#f4f4f5" : "#52525b",
                            borderRadius: "0.75rem",
                            height: "42px",
                            paddingLeft: "2.5rem",
                            textAlign: "left",
                            fontSize: "14px",
                          },
                        }}
                      >
                        {loading.positions 
                          ? "Loading organization..." 
                          : selectedPosition?.name || "Select parent position (optional)"}
                      </InputBase>
                    </Popover.Target>

                    <Popover.Dropdown 
                      style={{ 
                        backgroundColor: "#18181b", 
                        borderColor: "#27272a",
                        maxHeight: "250px",
                        overflowY: "auto"
                      }}
                    >
                      {treeData.length === 0 ? (
                        <Text size="xs" c="dimmed" ta="center" py="sm">No parent positions available.</Text>
                      ) : (
                        <Tree
                          tree={dropdownTree}
                          data={treeData}
                          levelOffset={24}
                          renderNode={({ node, expanded, hasChildren, elementProps }) => {
                            const isSelected = field.value === node.value;
                            return (
                              <Group
                                {...elementProps}
                                gap="xs"
                                py={5}
                                px="xs"
                                className={`rounded-md cursor-pointer transition-colors ${
                                  isSelected 
                                    ? "bg-blue-600 text-white font-semibold" 
                                    : "hover:bg-zinc-800 text-zinc-300"
                                }`}
                                onClick={(e) => {
                                  if ((e.target as HTMLElement).closest(".chevron-trigger")) return;
                                  field.onChange(node.value);
                                  setDropdownOpened(false);
                                }}
                              >
                                {hasChildren ? (
                                  <div
                                    className="chevron-trigger p-0.5 hover:bg-zinc-700/50 rounded"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dropdownTree.toggleExpanded(node.value);
                                    }}
                                  >
                                    <IconChevronRight
                                      size={14}
                                      className="transition-transform duration-200"
                                      style={{ transform: expanded ? "rotate(90deg)" : "none" }}
                                    />
                                  </div>
                                ) : (
                                  <Box w={18} />
                                )}
                                <Text size="sm">{node.label}</Text>
                              </Group>
                            );
                          }}
                        />
                      )}
                    </Popover.Dropdown>
                  </Popover>
                );
              }}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || loading.positions}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <IconPlus size={18} stroke={2.5} />
                Create Position
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default PositionForm;
