export type RenderItem = { 
  type: string, 
  identifier: string, 
  order: number, 
  group?: string,
  picked?: boolean,
  template: any,
  grouper?: any
  get?: any,
  set?: any
} 