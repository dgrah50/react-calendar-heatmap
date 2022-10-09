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
  tooltipDataAttrs?: any | ((value: any) => any);
  titleForValue?: (value: any) => string;
  classForValue?: (value: any) => string;
  monthLabels?: string[];
  weekdayLabels?: string[];
  onClick?: (value: any) => void;
  onMouseOver?: (value: any) => void;
  onMouseLeave?: (value: any) => void;
  transformDayElement?: (element: any, value: any) => any;
}


// eslint-disable-next-line react/prefer-stateless-function
export default class CalendarHeatmap extends React.Component<CalendarHeatmapProps> { }
