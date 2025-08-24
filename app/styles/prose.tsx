export const proseClasses = `
  prose mx-auto  py-12
  text-base sm:text-lg leading-relaxed
  

  /* Headings: clean blog style */
  prose-headings:text-zinc-700 dark:prose-headings:text-indigo-400
  prose-headings:font-bold
  prose-h1:text-2xl xs:prose-h1:text-xl sm:prose-h1:text-2xl lg:prose-h1:text-3xl xl:prose-h1:text-4xl prose-h1:font-extrabold prose-h1:mb-6 dark:prose-h1:text-indigo-400 prose-h1:text-indigo-800
  prose-h2:text-2xl sm:prose-h2:text-2xl lg:prose-h2:text-4xl xl:prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4
  prose-h3:text-xl sm:prose-h3:text-xl lg:prose-h3:text-3xl xl:prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3
  prose-h4:text-lg sm:prose-h4:text-lg prose-h4:font-medium prose-h4:mb-2 xl:prose-h4:text-lg

  /* Paragraphs */
  prose-p:text-zinc-800 dark:prose-p:text-zinc-200 prose-p:leading-7 prose-p:mb-6 xl:prose-p:text-base prose-p:leading-relaxed 

  /* Emphasis and strong */
  prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 
  prose-em:italic prose-em:text-zinc-800 dark:prose-em:text-zinc-200

  /* Blockquotes */
  prose-blockquote:border-l-4 prose-blockquote:border-amber-400 dark:prose-blockquote:border-amber-500
  prose-blockquote:bg-amber-50 dark:prose-blockquote:bg-amber-900/20
  prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:rounded-r-md
  prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300 prose-blockquote:italic

  /* Lists */
  prose-ul:pl-6 prose-ul:mb-6 prose-ol:pl-6 prose-ol:mb-6 dark:prose-ul:text-zinc-200 dark:prose-ol:text-zinc-200  xl:prose-ul:text-base xl:prose-ol:text-base 
  prose-li:marker:text-teal-600 dark:prose-li:marker:text-teal-400 prose-li:mb-1 xl:prose-p:text-sm xl:prose-li:text-base prose-li:prose-p:text-zinc-950 dark:prose-li:prose-p:text-white

  /* Links */
  prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:underline xl:prose-p:text-sm xl:prose-a:text-sm
  hover:prose-a:text-indigo-700 dark:hover:prose-a:text-indigo-300 transition-colors duration-200 xl:prose-a:text-sm

  /* Inline code */
   prose-code:px-1 prose-code:py-0.5 prose-code:rounded dark:prose-code:prose-pre:bg-none prose-code:bg-indigo-800/20 xl:prose-code:text-sm 
  prose-code:font-mono prose-code:text-sm dark:prose-code:text-indigo-400 prose-code:text-indigo-800 dark:prose-code:text-indigo-300 xl:prose-code:text-sm

  /* Code blocks */
  prose-pre:bg-zinc-200 dark:prose-pre:bg-zinc-900 prose-pre:rounded-md prose-pre:p-4 xl:prose-pre:text-sm dark:prose-pre:border-zinc-700 prose-pre:border prose-pre:border-zinc-400 
  prose-pre:overflow-x-auto prose-pre:font-mono prose-pre:text-sm sm:prose-pre:text-base xl:prose-pre:text-sm
  prose-pre:text-emerald-800 dark:prose-pre:text-emerald-300 xl:prose-pre:text-base

/* Tables */
prose-table:w-full prose-table:border-collapse prose-table:rounded-md prose-table:shadow-sm
prose-table:border prose-table:border-zinc-300 dark:prose-table:border-zinc-700
prose-th:bg-zinc-200 dark:prose-th:bg-zinc-800 prose-th:p-2 prose-th:font-semibold
prose-td:p-2 dark:prose-td:text-zinc-200 prose-td:text-zinc-900
prose-tbody tr:nth-child(even):bg-zinc-50 dark:prose-tbody tr:nth-child(even):bg-zinc-900/50


  /* Images */
  prose-img:rounded-md prose-img:shadow-sm prose-img:my-6

  /* HR */
  prose-hr:my-8 prose-hr:border-t prose-hr:border-zinc-300 dark:prose-hr:border-zinc-700

  /* Figure captions */
  prose-figcaption:mt-2 prose-figcaption:text-sm prose-figcaption:italic prose-figcaption:text-center
  prose-figcaption:text-zinc-600 dark:prose-figcaption:text-zinc-400
`;


export const proseClassesPrev = `
prose  py-12 text-base sm:text-lg leading-relaxed mx-auto
  
prose:w-full
  /* Headings: clean blog style */
  prose-headings:text-zinc-700 dark:prose-headings:text-indigo-400
  prose-headings:font-bold
  prose-h1:text-2xl xs:prose-h1:text-xl sm:prose-h1:text-2xl lg:prose-h1:text-3xl xl:prose-h1:text-4xl prose-h1:font-extrabold prose-h1:mb-6 dark:prose-h1:text-indigo-400 prose-h1:text-indigo-800
  prose-h2:text-2xl sm:prose-h2:text-2xl lg:prose-h2:text-4xl xl:prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4
  prose-h3:text-xl sm:prose-h3:text-xl lg:prose-h3:text-3xl xl:prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3
  prose-h4:text-lg sm:prose-h4:text-lg prose-h4:font-medium prose-h4:mb-2 xl:prose-h4:text-lg

  /* Paragraphs */
  prose-p:text-zinc-800 dark:prose-p:text-zinc-200 prose-p:leading-7 prose-p:mb-6 xl:prose-p:text-base prose-p:leading-relaxed 

  /* Emphasis and strong */
  prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 
  prose-em:italic prose-em:text-zinc-800 dark:prose-em:text-zinc-200

  /* Blockquotes */
  prose-blockquote:border-l-4 prose-blockquote:border-amber-400 dark:prose-blockquote:border-amber-500
  prose-blockquote:bg-amber-50 dark:prose-blockquote:bg-amber-900/20
  prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:rounded-r-md
  prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300 prose-blockquote:italic

  /* Lists */
  prose-ul:pl-6 prose-ul:mb-6 prose-ol:pl-6 prose-ol:mb-6 dark:prose-ul:text-zinc-200 dark:prose-ol:text-zinc-200  xl:prose-ul:text-base xl:prose-ol:text-base 
  prose-li:marker:text-teal-600 dark:prose-li:marker:text-teal-400 prose-li:mb-1 xl:prose-p:text-sm xl:prose-li:text-base prose-li:prose-p:text-zinc-950 dark:prose-li:prose-p:text-white

  /* Links */
  prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:underline xl:prose-p:text-sm xl:prose-a:text-sm
  hover:prose-a:text-indigo-700 dark:hover:prose-a:text-indigo-300 transition-colors duration-200 xl:prose-a:text-sm

  /* Inline code */
   prose-code:px-1 prose-code:py-0.5 prose-code:rounded dark:prose-code:prose-pre:bg-none prose-code:bg-indigo-800/20 xl:prose-code:text-sm 
  prose-code:font-mono prose-code:text-sm dark:prose-code:text-indigo-400 prose-code:text-indigo-800 dark:prose-code:text-indigo-300 xl:prose-code:text-sm

  /* Code blocks */
  prose-pre:bg-zinc-200 dark:prose-pre:bg-zinc-900 prose-pre:rounded-md prose-pre:p-4 xl:prose-pre:text-sm dark:prose-pre:border-zinc-700 prose-pre:border prose-pre:border-zinc-400 
  prose-pre:overflow-x-auto prose-pre:font-mono prose-pre:text-sm sm:prose-pre:text-base xl:prose-pre:text-sm
  prose-pre:text-emerald-800 dark:prose-pre:text-emerald-300 xl:prose-pre:text-base

/* Tables */
prose-table:w-full prose-table:border-collapse prose-table:rounded-md prose-table:shadow-sm
prose-table:border prose-table:border-zinc-300 dark:prose-table:border-zinc-700
prose-th:bg-zinc-200 dark:prose-th:bg-zinc-800 prose-th:p-2 prose-th:font-semibold
prose-td:p-2 dark:prose-td:text-zinc-200 prose-td:text-zinc-900
prose-tbody tr:nth-child(even):bg-zinc-50 dark:prose-tbody tr:nth-child(even):bg-zinc-900/50


  /* Images */
  prose-img:rounded-md prose-img:shadow-sm prose-img:my-6

  /* HR */
  prose-hr:my-8 prose-hr:border-t prose-hr:border-zinc-300 dark:prose-hr:border-zinc-700

  /* Figure captions */
  prose-figcaption:mt-2 prose-figcaption:text-sm prose-figcaption:italic prose-figcaption:text-center
  prose-figcaption:text-zinc-600 dark:prose-figcaption:text-zinc-400
`;