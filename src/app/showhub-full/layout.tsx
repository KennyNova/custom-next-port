export default function ShowHubFullLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-background">
      {children}
    </div>
  );
}
