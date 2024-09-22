'use client'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {usePathname} from "next/navigation";
import {Fragment} from "react";
import {useI18n} from "@/i18n";
import Link from "next/link";

export default function BreadcrumbGroup() {
  const $t = useI18n()
  const paths = usePathname().split('/').filter(Boolean).reduce<{ text: string, href: string }[]>((pre, cur) => {
    pre.push({
      text: cur,
      href: (pre.at(-1)?.href || "") + '/' + cur
    })
    return pre
  }, [])
  return <Breadcrumb className="hidden sm:block">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link className="first-letter:uppercase" href="/">{$t('home')}</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      {paths.map((item) => (
        <Fragment key={item.href}>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link className="first-letter:uppercase" href={item.href}>{$t(item.text)}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Fragment>))}
    </BreadcrumbList>
  </Breadcrumb>

}
