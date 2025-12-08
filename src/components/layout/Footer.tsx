export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-foreground">RestaurantOS v1.0</span>
        <span className="text-xs sm:text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} NCC UAT Portal • All Rights Reserved
        </span>
      </div>
    </footer>
  );
};
