export const proseClasses = `
  prose mx-auto max-w-3xl
  text-base sm:text-lg leading-relaxed
  

  /* Headings: clean blog style */
  prose-headings:text-slate-700 dark:prose-headings:text-indigo-400
  prose-headings:font-bold
  prose-h1:text-3xl sm:prose-h1:text-3xl lg:prose-h1:text-5xl prose-h1:font-extrabold prose-h1:mb-6 dark:prose-h1:text-indigo-400 prose-h1:text-indigo-800
  prose-h2:text-2xl sm:prose-h2:text-2xl lg:prose-h2:text-4xl prose-h2:font-bold prose-h2:mb-4
  prose-h3:text-xl sm:prose-h3:text-xl lg:prose-h3:text-3xl prose-h3:font-semibold prose-h3:mb-3
  prose-h4:text-lg sm:prose-h4:text-lg prose-h4:font-medium prose-h4:mb-2

  /* Paragraphs */
  prose-p:text-slate-800 dark:prose-p:text-slate-200 prose-p:leading-7 prose-p:mb-6

  /* Emphasis and strong */
  prose-strong:font-semibold prose-strong:text-slate-900 dark:prose-strong:text-slate-100
  prose-em:italic prose-em:text-slate-800 dark:prose-em:text-slate-200

  /* Blockquotes */
  prose-blockquote:border-l-4 prose-blockquote:border-amber-400 dark:prose-blockquote:border-amber-500
  prose-blockquote:bg-amber-50 dark:prose-blockquote:bg-amber-900/20
  prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:rounded-r-md
  prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300 prose-blockquote:italic

  /* Lists */
  prose-ul:pl-6 prose-ul:mb-6 prose-ol:pl-6 prose-ol:mb-6 dark:prose-ul:text-slate-200
  prose-li:marker:text-teal-600 dark:prose-li:marker:text-teal-400 prose-li:mb-1

  /* Links */
  prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline
  hover:prose-a:text-blue-700 dark:hover:prose-a:text-blue-300 transition-colors duration-200

  /* Inline code */
   prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:bg-transparent prose-code:bg-indigo-500/20
  prose-code:font-mono prose-code:text-sm prose-code:text-pink-500 dark:prose-code:text-blue-300

  /* Code blocks */
  prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:rounded-lg prose-pre:p-4
  prose-pre:overflow-x-auto prose-pre:font-mono prose-pre:text-sm sm:prose-pre:text-base
  prose-pre:text-emerald-200 dark:prose-pre:text-emerald-300

/* Tables */
prose-table:w-full prose-table:border-collapse prose-table:rounded-md prose-table:shadow-sm
prose-table:border prose-table:border-slate-300 dark:prose-table:border-slate-700
prose-th:bg-slate-200 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:font-semibold
prose-td:p-2 dark:prose-td:text-slate-200 prose-td:text-slate-900
prose-tbody tr:nth-child(even):bg-slate-50 dark:prose-tbody tr:nth-child(even):bg-slate-900/50


  /* Images */
  prose-img:rounded-md prose-img:shadow-sm prose-img:my-6

  /* HR */
  prose-hr:my-8 prose-hr:border-t prose-hr:border-slate-300 dark:prose-hr:border-slate-700

  /* Figure captions */
  prose-figcaption:mt-2 prose-figcaption:text-sm prose-figcaption:italic prose-figcaption:text-center
  prose-figcaption:text-slate-600 dark:prose-figcaption:text-slate-400
`;
