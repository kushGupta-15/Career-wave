interface iAppProps {
    days: number;
    price: number;
    description: string;
}
export const jobListingDurationPricing : iAppProps[] = [
    {
        days: 7,
        price: 29,
        description: "Basic 1-Week Listing",
    },
    {
        days: 14,
        price: 49,
        description: "Quick Reach Listing",
    },
    {
        days: 30,
        price: 99,
        description: "Standard listing",
    },
    {
        days: 45,
        price: 139,
        description: "Featured Boost Listing",
    },
    {
        days: 60,
        price: 179,
        description: "Exclusive listing",
    },
    {
        days: 90,
        price: 249,
        description: "Greatest Exposure",
    },
    {
        days: 120,
        price: 299,
        description: "Ultimate Visibility",
    },
    {
        days: 180,
        price: 399,
        description: "Long-Term Premium Listing",
    }
]