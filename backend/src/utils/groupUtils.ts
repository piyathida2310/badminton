
export function getGroupColor(groupId: string) {
    const colors: Record<string, string> = {
        A: "from-yellow-100 to-yellow-50 border-yellow-400 shadow-yellow-200/50",
        B: "from-blue-100 to-blue-50 border-blue-400 shadow-blue-200/50",
        C: "from-pink-100 to-pink-50 border-pink-400 shadow-pink-200/50",
        D: "from-green-100 to-green-50 border-green-400 shadow-green-200/50",
        E: "from-orange-100 to-orange-50 border-orange-400 shadow-orange-200/50",
        F: "from-purple-100 to-purple-50 border-purple-400 shadow-purple-200/50",
        G: "from-teal-100 to-teal-50 border-teal-400 shadow-teal-200/50",
        H: "from-red-100 to-red-50 border-red-400 shadow-red-200/50",
    };
    return (
        colors[groupId] ||
        "from-gray-100 to-gray-50 border-gray-400 shadow-gray-200/50"
    );
}

export function getGroupHeaderColor(groupId: string) {
    const colors: Record<string, string> = {
        A: "bg-yellow-400/80 text-yellow-900",
        B: "bg-blue-400/80 text-blue-900",
        C: "bg-pink-400/80 text-pink-900",
        D: "bg-green-400/80 text-green-900",
        E: "bg-orange-400/80 text-orange-900",
        F: "bg-purple-400/80 text-purple-900",
        G: "bg-teal-400/80 text-teal-900",
        H: "bg-red-400/80 text-red-900",
    };
    return colors[groupId] || "bg-gray-400/80 text-gray-900";
}
