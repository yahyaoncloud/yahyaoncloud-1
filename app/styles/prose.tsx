export const proseClasses = `
  prose max-w-none
  prose mx-auto
  prose text-sm
  prose md:text-base

  /* Headings */
  prose-headings:text-slate-900 dark:prose-headings:text-white
  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-base

  /* Paragraphs */
  prose-p:text-slate-800 dark:prose-p:text-slate-100
  prose-p:sm:text-base prose-p:md:text-lg prose-p:xs:text-base

  /* Bold / Strong */
  prose-strong:text-slate-900 dark:prose-strong:text-slate-100
  prose-strong:font-semibold

  /* Italic / Emphasis */
  prose-em:text-slate-900 dark:prose-em:text-slate-100

  /* Blockquotes */
  prose-blockquote:border-x-2
  prose-blockquote:border-amber-400 dark:prose-blockquote:border-amber-500
  prose-blockquote:bg-amber-50 dark:prose-blockquote:bg-amber-800/20
  prose-blockquote:p-1 prose-blockquote:italic
  prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-200
  prose-blockquote:md:text-sm prose-blockquote:sm:text-base prose-blockquote:xs:text-sm

  /* Lists */
  prose-ul:text-slate-800 dark:prose-ul:text-slate-100
  prose-ol:text-slate-800 dark:prose-ol:text-slate-100
  prose-li:text-slate-800 dark:prose-li:text-slate-100
  prose-li:marker:text-teal-600 dark:prose-li:marker:text-teal-400
  prose-li:px-0.5 prose-li:text-sm
  prose-li > p:text-slate-800 dark:prose-li > p:text-slate-100

  /* Links */
  prose-a:text-blue-600 dark:prose-a:text-blue-300
  prose-a:no-underline hover:prose-a:underline

  /* Inline code */
  prose-code:text-blue-700 dark:prose-code:text-fuchsia-300
  prose-code:px-0.5 prose-code:py-0.25 prose-code:rounded-sm prose-code:bg-transparent
  prose-code:md:text-sm
  prose-code:sm:text-xs

  /* Code blocks */
  prose-pre:bg-slate-300 dark:prose-pre:bg-slate-950
  prose-pre:text-emerald-800 dark:prose-pre:text-emerald-200
  prose-pre:rounded-md
  prose-pre:overflow-x-auto
  prose-pre:md:text-sm
  prose-pre:sm:text-xs 
  prose-pre:p-2

  /* Tables */
  prose-table:overflow-auto prose-table:flex prose-table:flex-col prose-table:w-full prose-table:border-collapse prose-table:rounded-md prose-table:shadow-sm
  prose-table:xs:text-xs prose-table:sm:text-sm prose-table:md:text-base
  prose-th:bg-slate-200 dark:prose-th:bg-slate-800 prose-th:text-slate-900 prose-th:justify-between  dark:prose-th:text-white
  prose-th:font-semibold prose-th:p-2 prose-th:xs:p-1 prose-th:sm:p-1.5 prose-th:md:p-2
  prose-th:sm:text-xs prose-th:md:text-base
  prose-td:text-slate-800 dark:prose-td:text-slate-100 prose-td:p-2 prose-td:xs:p-1 prose-td:sm:p-1.5 prose-td:md:p-2
  prose-td:sm:text-xs prose-td:md:text-base
  prose-tbody:even:bg-slate-50 dark:prose-tbody:even:bg-slate-900/50
  prose-tbody:odd:bg-white dark:prose-tbody:odd:bg-slate-950
  prose-tbody:hover:bg-slate-100 dark:prose-tbody:hover:bg-slate-800/50
  prose-thead:border-b-2 prose-thead:border-slate-300 dark:prose-thead:border-slate-700
  prose-tbody:border-b prose-tbody:border-slate-200 dark:prose-tbody:border-slate-800
  prose-table:border prose-table:border-slate-300 dark:prose-table:border-slate-700

  /* Horizontal rule */
  prose-hr:border-slate-300 dark:prose-hr:border-slate-700
`;
