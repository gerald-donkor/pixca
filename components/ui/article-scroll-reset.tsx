"use client";

import * as React from "react";

export interface ArticleScrollResetProps {
  articleId: string;
}

export function ArticleScrollReset({ articleId }: ArticleScrollResetProps) {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [articleId]);

  return null;
}
