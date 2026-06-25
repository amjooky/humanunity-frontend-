import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // In a real app, query table todos. If the table doesn't exist, this fails silently or returns an empty array.
  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <Section padding="lg" background="white">
      <Container className="max-w-md">
        <h1 className="font-display font-bold text-2xl mb-6">Supabase Test: Todos</h1>
        {error && (
          <div className="bg-red-50 text-error p-4 rounded-xl border border-red-100 text-xs mb-4">
            Error: {error.message}
          </div>
        )}
        {todos && todos.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {todos.map((todo: any) => (
              <li
                key={todo.id}
                className="p-4 bg-surface-100 border border-border-default rounded-xl font-body text-sm"
              >
                {todo.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-body text-xs text-text-tertiary">
            Aucun todo trouvé. Créez une table 'todos' avec une colonne 'name' dans votre base Supabase pour tester en temps réel !
          </p>
        )}
      </Container>
    </Section>
  );
}
