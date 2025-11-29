import React from 'react'

interface HeadingProps {
  title: string
  children?: React.ReactNode
}

interface HeadingSmallProps extends HeadingProps {
  description?: string
}

export const Heading: React.FC<HeadingProps> = ({ title, children }) => (
  <h2 className="text-2xl font-semibold leading-tight">{title}{children}</h2>
)

export const HeadingSmall: React.FC<HeadingSmallProps> = ({ title, description }) => (
  <div className="mb-2">
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
  </div>
)

export default Heading
