import React from 'react'

export interface CalendarHeatmapProps {
  values: Array<{
    date: string | number | Date;
  }>;
  firstWeekdayMonday?: boolean;
  numDays?: number;
  startDate?: string | number | Date;
  endDate?: string | number | Date;
  gutterSize?: number;
  horizontal?: boolean;
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  showOutOfRangeDays?: boolean;
  tooltipDataAttrs?: any | ((value: number) => void);
  titleForValue?: (value: any) => string;
  classForValue?: (value: any) => string;
  monthLabels?: string[];
  weekdayLabels?: string[];
  onClick?: (value: number) => void;
  onMouseOver?: (value: number) => void;
  onMouseLeave?: (value: number) => void;
  transformDayElement?: (element: any, value: any) => any;
  shouldPadWeekdayLabels?: boolean;
}


// eslint-disable-next-line react/prefer-stateless-function
export default class CalendarHeatmap extends React.Component<CalendarHeatmapProps> { }
