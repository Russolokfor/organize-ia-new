"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TaskList from "@/components/TaskList";

import {
  Card,
  CardHeader,
  CardHeaderRow,
  CardTitle,
  CardHeadline,
  CardDescription,
  CardContent,
  CardActionButton,
} from "@/components/ui/Card";

type RoutineBlock = {
  id: string;
  title: string;
  due_label?: string | null;
  pinned?: boolean | null;
};

export default function TodayClient() {
  const [tasks, setTasks] = useState<RoutineBlock[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    setLoading(true);

    const { data } = await supabase
      .from("routine")
      .select("*")
      .limit(10);

    setTasks(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="grid gap-4">

      <Card>
        <CardHeader>
          <CardHeaderRow
            left={
              <>
                <CardTitle>FOCO</CardTitle>
                <CardHeadline>Hoje</CardHeadline>
                <CardDescription>
                  O que merece sua atenção agora.
                </CardDescription>
              </>
            }
            right={
              <CardActionButton>
                Ir para Rotina
              </CardActionButton>
            }
          />
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-muted">Carregando...</div>
          ) : (
            <TaskList
              items={tasks.map((t) => ({
                id: t.id,
                title: t.title,
                dueLabel: t.due_label ?? "—",
                pinned: t.pinned ?? false,
              }))}
            />
          )}
        </CardContent>
      </Card>

    </div>
  );
}