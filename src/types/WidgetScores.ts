export type WidgetsScore = { 
  [widget: string]: WidgetScore
}

export type WidgetScore = { 
  commonName: number, 
  datatype: number, 
  properties: number,
  requiredProperties: number,
  total: number,
  widget: string
} 