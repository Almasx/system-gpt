import { TreeProvider } from "~/components/providers";

export default async function Layout(props: {
  children: React.ReactNode;
  goal: React.ReactNode;
}) {
  return (
    <div className="bg-light-secondary">
      <TreeProvider>
        {props.children}
        {props.goal}
      </TreeProvider>
    </div>
  );
}
