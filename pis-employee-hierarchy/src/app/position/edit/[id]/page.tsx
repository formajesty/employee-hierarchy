"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Popover, InputBase, Tree, useTree, TreeNodeData, Box, Group, 
  Text, CloseButton, Button, Modal, Divider 
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { 
  IconBriefcase, IconFileDescription, IconHierarchy2, 
  IconAlertCircle, IconDeviceFloppy, IconTrash, IconArrowLeft, IconChevronRight 
} from "@tabler/icons-react";
import { 
  deletePosition, 
  fetchPositionById, 
  fetchPositions, 
  updatePosition 
} from "@/store/positionSlice";
import { AppDispatch, RootState } from "@/store/store";

interface PositionData {
  id: string;
  name: string;
  description: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
}

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Name must be at least 3 characters")
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

function transformToTreeData(flatList: PositionData[], currentId: string): TreeNodeData[] {
  const map: Record<string, TreeNodeData & { children: TreeNodeData[] }> = {};
  const roots: TreeNodeData[] = [];

  const filteredList = flatList.filter(item => String(item.id) !== String(currentId));

  filteredList.forEach((item) => {
    map[item.id] = {
      value: item.id,
      label: item.name,
      children: [],
    };
  });

  filteredList.forEach((item) => {
    const node = map[item.id];
    const parentId = item.parent?.id || item.parentId;

    if (parentId && map[parentId]) {
      map[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

const Page = () => {
  const param = useParams();
  const id = param.id as string;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const dropdownTree = useTree();
  
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { positions, currentPosition, loading } = useSelector(
    (state: RootState) => state.position
  ) as unknown as { 
    positions: PositionData[]; 
    currentPosition: PositionData | null; 
    loading: { positionById: boolean; update: boolean; delete: boolean }; 
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
    },
  });

  // Fetch data
  useEffect(() => {
    dispatch(fetchPositionById(id));
    dispatch(fetchPositions());
  }, [dispatch, id]);

  // Reset form with current data
  useEffect(() => {
    if (currentPosition && String(currentPosition.id) === String(id)) {
      reset({
        name: currentPosition.name || "",
        description: currentPosition.description || "",
        parentId: currentPosition.parent?.id || currentPosition.parentId || null,
      });
    }
  }, [currentPosition, reset, id]);

  const treeData = useMemo(() => {
    if (!positions || positions.length === 0) return [];
    return transformToTreeData(positions, id);
  }, [positions, id]);

  const onUpdateSubmit = async (data: FormValues) => {
    setErrorMessage(""); 

    try {
      await dispatch(updatePosition({
        id: id,
        positionData: {
          name: data.name || "",
          description: data.description || "",
          parentId: data.parentId,
        }
      })).unwrap();
      
      router.push("/");
    } catch (error: any) {
      console.error("Error updating position:", error);
      
      const message = 
        error?.message || 
        error?.payload?.message || 
        error?.error?.message || 
        "Failed to update position. Please try again.";

      setErrorMessage(message);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deletePosition(id)).unwrap();
      closeDeleteModal();
      router.push("/");
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to delete position");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 p-12 dark:bg-zinc-950">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="subtle" 
            color="gray" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push("/")}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Back to Hierarchy
          </Button>
        </div>

        {/* Main Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
        >
          <div className="mb-8">
            <h2 className="text-2xl text-zinc-100 font-bold tracking-tight">Edit Position</h2>
            <p className="text-zinc-400 text-sm mt-1">Modify structural fields, descriptions, and reporting lines.</p>
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
                  <p className="font-medium">Update Failed</p>
                  <p className="text-sm mt-1">{errorMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5 ml-1">Position Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                  <IconBriefcase size={18} />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <AnimatePresence>
                {errors.name && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <IconAlertCircle size={12} /> {errors.name.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5 ml-1">Description</label>
              <div className="relative group">
                <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                  <IconFileDescription size={18} />
                </div>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 resize-none"
                />
              </div>
              <AnimatePresence>
                {errors.description && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <IconAlertCircle size={12} /> {errors.description.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Parent Position Dropdown */}
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
                    <Popover opened={dropdownOpened} onChange={setDropdownOpened} position="bottom" width="target" transitionProps={{ transition: "pop" }} radius="lg" shadow="md">
                      <Popover.Target>
                        <InputBase
                          component="button" 
                          type="button" 
                          pointer
                          onClick={() => setDropdownOpened((o) => !o)}
                          leftSection={<IconHierarchy2 size={18} className="text-zinc-500" />}
                          rightSection={field.value ? (
                            <CloseButton onMouseDown={(e) => { e.stopPropagation(); field.onChange(null); }} />
                          ) : (
                            <div className="flex items-center justify-center w-4 h-4">
                              <IconChevronRight size={16} className="rotate-90 text-zinc-500" />
                            </div>
                          )}
                          styles={{
                            input: {
                              backgroundColor: "rgba(9, 9, 11, 0.5)",
                              borderColor: "#27272a",
                              color: selectedPosition ? "#f4f4f5" : "#52525b",
                              borderRadius: "0.75rem",
                              height: "42px",
                              paddingLeft: "2.5rem",
                              textAlign: "left",
                            },
                          }}
                        >
                          {selectedPosition?.name || "Select parent position (optional)"}
                        </InputBase>
                      </Popover.Target>

                      <Popover.Dropdown style={{ backgroundColor: "#18181b", borderColor: "#27272a", maxHeight: "250px", overflowY: "auto" }}>
                        {treeData.length === 0 ? (
                          <Text size="xs" c="dimmed" ta="center" py="sm">No available parent positions.</Text>
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
                                    isSelected ? "bg-blue-600 text-white font-semibold" : "hover:bg-zinc-800 text-zinc-300"
                                  }`}
                                  onClick={() => {
                                    field.onChange(node.value);
                                    setDropdownOpened(false);
                                  }}
                                >
                                  {hasChildren ? (
                                    <div 
                                      className="p-0.5 hover:bg-zinc-700/50 rounded"
                                      onClick={(e) => { e.stopPropagation(); dropdownTree.toggleExpanded(node.value); }}
                                    >
                                      <IconChevronRight size={14} style={{ transform: expanded ? "rotate(90deg)" : "none" }} />
                                    </div>
                                  ) : <Box w={18} />}
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
            <Button
              type="submit"
              loading={loading?.update}
              leftSection={<IconDeviceFloppy size={18} />}
              className="w-full mt-4 h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/10"
            >
              Save Changes
            </Button>
          </form>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full p-6 bg-white border border-red-100 rounded-2xl shadow-sm"
        >
          <Group justify="space-between">
            <div>
              <Text fw={600} className="text-zinc-900 font-semibold">Danger Zone</Text>
              <Text size="xs" className="text-zinc-500 mt-0.5">Permanently remove this position.</Text>
            </div>
            <Button 
              variant="light" 
              color="red" 
              leftSection={<IconTrash size={16} />}
              onClick={openDeleteModal}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-medium transition-colors"
            >
              Delete Position
            </Button>
          </Group>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirm Position Deletion"
        centered
        radius="lg"
        styles={{
          content: { backgroundColor: "#18181b", border: "1px solid #27272a", color: "#f4f4f5" },
          header: { backgroundColor: "#18181b", color: "#f4f4f5" }
        }}
      >
        <div className="space-y-4">
          <Text size="sm" className="text-zinc-400">
            Are you sure you want to delete <span className="text-zinc-200 font-semibold">&quot;{currentPosition?.name}&quot;</span>? 
            This action cannot be undone.
          </Text>
          <Divider color="zinc.800" />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button 
              color="red" 
              loading={loading?.delete}
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </Button>
          </Group>
        </div>
      </Modal>
    </main>
  );
};

export default Page;