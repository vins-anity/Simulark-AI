import { MarketingLayoutClient } from "./MarketingLayoutClient";

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
    return <MarketingLayoutClient>{children}</MarketingLayoutClient>;
}
