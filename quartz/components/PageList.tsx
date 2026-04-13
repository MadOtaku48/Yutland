import { FullSlug, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { GlobalConfiguration } from "../cfg"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

export function byDateAndAlphabetical(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort by frontmatter order field first (for phases etc.)
    const f1Order = f1.frontmatter?.order as number | undefined
    const f2Order = f2.frontmatter?.order as number | undefined
    if (f1Order !== undefined && f2Order !== undefined) {
      return f1Order - f2Order
    } else if (f1Order !== undefined) {
      return -1
    } else if (f2Order !== undefined) {
      return 1
    }

    // Then by slug (filename) for consistent ordering
    const f1Slug = f1.slug ?? ""
    const f2Slug = f2.slug ?? ""
    return f1Slug.localeCompare(f2Slug)
  }
}

export function byDateAndAlphabeticalFolderFirst(cfg: GlobalConfiguration): SortFn {
  return (f1, f2) => {
    // Sort folders first
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    // Sort by frontmatter order field first
    const f1Order = f1.frontmatter?.order as number | undefined
    const f2Order = f2.frontmatter?.order as number | undefined
    if (f1Order !== undefined && f2Order !== undefined) {
      return f1Order - f2Order
    } else if (f1Order !== undefined) {
      return -1
    } else if (f2Order !== undefined) {
      return 1
    }

    // Then by slug (filename)
    const f1Slug = f1.slug ?? ""
    const f2Slug = f2.slug ?? ""
    return f1Slug.localeCompare(f2Slug)
  }
}

type Props = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

export const PageList: QuartzComponent = ({ cfg, fileData, allFiles, limit, sort }: Props) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst(cfg)
  let list = allFiles.sort(sorter)
  if (limit) {
    list = list.slice(0, limit)
  }

  return (
    <ul class="section-ul">
      {list.map((page) => {
        const title = page.frontmatter?.title
        const tags = page.frontmatter?.tags ?? []

        return (
          <li class="section-li">
            <div class="section">
              <p class="meta">
                {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
              </p>
              <div class="desc">
                <h3>
                  <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                    {title}
                  </a>
                </h3>
              </div>
              <ul class="tags">
                {tags.map((tag) => (
                  <li>
                    <a
                      class="internal tag-link"
                      href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

PageList.css = `
.section h3 {
  margin: 0;
}

.section > .tags {
  margin: 0;
}
`
