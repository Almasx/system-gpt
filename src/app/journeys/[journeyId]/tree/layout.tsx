import { TreeProvider } from "~/components/providers";

export default async function Layout(props: {
  children: React.ReactNode;
  goal: React.ReactNode;
}) {
  return (
    <TreeProvider>
      {props.children}
      {props.goal}
    </TreeProvider>
  );
}
