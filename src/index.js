import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import { DAYS_IN_WEEK, MILLISECONDS_IN_ONE_DAY, DAY_LABELS, MONTH_LABELS } from './constants';
import {
  dateNDaysAgo,
  shiftDate,
  getBeginningTimeForDate,
  convertToDate,
  getRange,
  convertToUtc,
} from './helpers';

const SQUARE_SIZE = 10;
const MONTH_LABEL_GUTTER_SIZE = 4;
const CSS_PSEUDO_NAMESPACE = 'react-calendar-heatmap-';

class CalendarHeatmap extends React.Component {
  getDateDifferenceInDays() {
    const { numDays } = this.props;
    if (numDays) {
      // eslint-disable-next-line no-console
      console.warn(
        'numDays is a deprecated prop. It will be removed in the next release. Consider using the startDate prop instead.',
      );
      return numDays;
    }
    const utc1 = convertToUtc(this.getStartDate());
    const utc2 = convertToUtc(shiftDate(this.getEndDate(), 1)); // shift date 1 because end date is inclusive

    return Math.floor((utc2 - utc1) / MILLISECONDS_IN_ONE_DAY);
  }

  getSquareSizeWithGutter() {
    return SQUARE_SIZE + this.props.gutterSize;
  }

  getMonthLabelSize() {
    if (!this.props.showMonthLabels) {
      return 0;
    }
    if (this.props.horizontal) {
      return SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE;
    }
    return 2 * (SQUARE_SIZE + MONTH_LABEL_GUTTER_SIZE);
  }

  getWeekdayLabelSize() {
    if (!this.props.showWeekdayLabels) {
      return 0;
    }
    if (this.props.horizontal) {
      return 30;
    }
    return SQUARE_SIZE * 1.5;
  }

  getStartDate() {
    return getBeginningTimeForDate(convertToDate(this.props.startDate));
  }

  getEndDate() {
    return getBeginningTimeForDate(convertToDate(this.props.endDate));
  }

  getStartDateWithEmptyDays() {
    return shiftDate(this.getStartDate(), -this.getNumEmptyDaysAtStart());
  }

  getNumEmptyDaysAtStart() {
    return this.props.firstWeekdayMonday ? (this.getStartDate().getDay() || 7) - 1 : this.getStartDate().getDay();
  }

  getNumEmptyDaysAtEnd() {
    return (DAYS_IN_WEEK - 1) - (this.props.firstWeekdayMonday ? (this.getEndDate().getDay() || 7) - 1 : this.getEndDate().getDay());
  }

  getWeekCount() {
    const numDaysRoundedToWeek =
      this.getDateDifferenceInDays() + this.getNumEmptyDaysAtStart() + this.getNumEmptyDaysAtEnd();
    return Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK);
  }

  getWeekWidth() {
    return DAYS_IN_WEEK * this.getSquareSizeWithGutter();
  }

  getWidth() {
    return (
      this.getWeekCount() * this.getSquareSizeWithGutter() -
      (this.props.gutterSize - this.getWeekdayLabelSize())
    );
  }

  getHeight() {
    return (
      this.getWeekWidth() +
      (this.getMonthLabelSize() - this.props.gutterSize)
    );
  }

  getValueCache = memoizeOne((props) =>
    props.values.reduce((memo, value) => {
      const utc1 = convertToUtc(convertToDate(value.date));
      const utc2 = convertToUtc(this.getStartDateWithEmptyDays());
      const index = Math.floor((utc1 - utc2) / MILLISECONDS_IN_ONE_DAY);
      // eslint-disable-next-line no-param-reassign
      memo[index] = {
        value,
        className: this.props.classForValue(value),
        title: this.props.titleForValue ? this.props.titleForValue(value) : null,
        tooltipDataAttrs: this.getTooltipDataAttrsForValue(value),
      };
      return memo;
    }, {}),
  );

  getValueForIndex(index) {
    if (this.valueCache[index]) {
      return this.valueCache[index].value;
    }
    return null;
  }

  getClassNameForIndex(index) {
    if (this.valueCache[index]) {
      return this.valueCache[index].className;
    }
    return this.props.classForValue(null);
  }

  getTitleForIndex(index) {
    if (this.valueCache[index]) {
      return this.valueCache[index].title;
    }
    return this.props.titleForValue ? this.props.titleForValue(null) : null;
  }

  getTooltipDataAttrsForIndex(index) {
    if (this.valueCache[index]) {
      return this.valueCache[index].tooltipDataAttrs;
    }
    return this.getTooltipDataAttrsForValue({ date: null, count: null });
  }

  getTooltipDataAttrsForValue(value) {
    const { tooltipDataAttrs } = this.props;

    if (typeof tooltipDataAttrs === 'function') {
      return tooltipDataAttrs(value);
    }
    return tooltipDataAttrs;
  }

  getTransformForWeek(weekIndex) {
    if (this.props.horizontal) {
      return `translate(${weekIndex * this.getSquareSizeWithGutter()}, 0)`;
    }
    return `translate(0, ${weekIndex * this.getSquareSizeWithGutter()})`;
  }

  getTransformForWeekdayLabels() {
    if (this.props.horizontal) {
      if (!this.props.shouldPadWeekdayLabels) {
        return `translate(0, ${this.getMonthLabelSize()})`;
      }
      return `translate(${SQUARE_SIZE}, ${this.getMonthLabelSize()})`;
    }
    return null;
  }

  getTransformForMonthLabels() {
    if (this.props.horizontal) {
      return `translate(${this.getWeekdayLabelSize()}, 0)`;
    }
    return `translate(${this.getWeekWidth() +
      MONTH_LABEL_GUTTER_SIZE}, ${this.getWeekdayLabelSize()})`;
  }

  getTransformForAllWeeks() {
    if (this.props.horizontal) {
      return `translate(${this.getWeekdayLabelSize()}, ${this.getMonthLabelSize()})`;
    }
    return `translate(0, ${this.getWeekdayLabelSize()})`;
  }

  getViewBox() {
    if (this.props.horizontal) {
      return `0 0 ${this.getWidth()} ${this.getHeight()}`;
    }
    return `0 0 ${this.getHeight()} ${this.getWidth()}`;
  }

  getSquareCoordinates(dayIndex) {
    if (this.props.horizontal) {
      return [0, dayIndex * this.getSquareSizeWithGutter()];
    }
    return [dayIndex * this.getSquareSizeWithGutter(), 0];
  }

  getWeekdayLabelCoordinates(dayIndex) {
    if (this.props.horizontal) {
      return [0, (dayIndex + 1) * SQUARE_SIZE + dayIndex * this.props.gutterSize];
    }
    return [dayIndex * SQUARE_SIZE + dayIndex * this.props.gutterSize, SQUARE_SIZE];
  }

  getMonthLabelCoordinates(weekIndex) {
    if (this.props.horizontal) {
      return [
        weekIndex * this.getSquareSizeWithGutter(),
        this.getMonthLabelSize() - MONTH_LABEL_GUTTER_SIZE,
      ];
    }
    const verticalOffset = -2;
    return [0, (weekIndex + 1) * this.getSquareSizeWithGutter() + verticalOffset];
  }

  handleClick(value) {
    if (this.props.onClick) {
      this.props.onClick(value);
    }
  }

  handleMouseOver(e, value) {
    if (this.props.onMouseOver) {
      this.props.onMouseOver(e, value);
    }
  }

  handleMouseLeave(e, value) {
    if (this.props.onMouseLeave) {
      this.props.onMouseLeave(e, value);
    }
  }

  renderSquare(dayIndex, index) {
    const indexOutOfRange =
      index < this.getNumEmptyDaysAtStart() ||
      index >= this.getNumEmptyDaysAtStart() + this.getDateDifferenceInDays();
    if (indexOutOfRange && !this.props.showOutOfRangeDays) {
      return null;
    }
    const [x, y] = this.getSquareCoordinates(dayIndex);
    const value = this.getValueForIndex(index);
    const rect = (
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      <rect
        key={index}
        width={SQUARE_SIZE}
        height={SQUARE_SIZE}
        x={x}
        y={y}
        className={this.getClassNameForIndex(index)}
        onClick={() => this.handleClick(value)}
        onMouseOver={(e) => this.handleMouseOver(e, value)}
        onMouseLeave={(e) => this.handleMouseLeave(e, value)}
        {...this.getTooltipDataAttrsForIndex(index)}
      >
        <title>{this.getTitleForIndex(index)}</title>
      </rect>
    );
    const { transformDayElement } = this.props;
    return transformDayElement ? transformDayElement(rect, value, index) : rect;
  }

  renderWeek(weekIndex) {
    return (
      <g
        key={weekIndex}
        transform={this.getTransformForWeek(weekIndex)}
        className={`${CSS_PSEUDO_NAMESPACE}week`}
      >
        {getRange(DAYS_IN_WEEK).map((dayIndex) =>
          this.renderSquare(dayIndex, weekIndex * DAYS_IN_WEEK + dayIndex),
        )}
      </g>
    );
  }

  renderAllWeeks() {
    return getRange(this.getWeekCount()).map((weekIndex) => this.renderWeek(weekIndex));
  }

  renderMonthLabels() {
    if (!this.props.showMonthLabels) {
      return null;
    }
    const weekRange = getRange(this.getWeekCount() - 1); // don't render for last week, because label will be cut off
    return weekRange.map((weekIndex) => {
      const endOfWeek = shiftDate(this.getStartDateWithEmptyDays(), (weekIndex + 1) * DAYS_IN_WEEK);
      const [x, y] = this.getMonthLabelCoordinates(weekIndex);
      return endOfWeek.getDate() >= 1 && endOfWeek.getDate() <= DAYS_IN_WEEK ? (
        <text key={weekIndex} x={x} y={y} className={`${CSS_PSEUDO_NAMESPACE}month-label`}>
          {this.props.monthLabels[endOfWeek.getMonth()]}
        </text>
      ) : null;
    });
  }

  renderWeekdayLabels() {
    if (!this.props.showWeekdayLabels) {
      return null;
    }
    const weekdayLabels = this.props.firstWeekdayMonday ? [...this.props.weekdayLabels.slice(1), this.props.weekdayLabels[0]] : this.props.weekdayLabels;

    return weekdayLabels.map((weekdayLabel, dayIndex) => {
      const [x, y] = this.getWeekdayLabelCoordinates(dayIndex);
      const cssClasses = `${this.props.horizontal ? '' : `${CSS_PSEUDO_NAMESPACE}small-text`
        } ${CSS_PSEUDO_NAMESPACE}weekday-label`;
      return (
        <text key={`${x}${y}`} x={x} y={y} className={cssClasses}>
          {weekdayLabel}
        </text>
      );
    });
  }

  render() {
    this.valueCache = this.getValueCache(this.props);

    return (
      <svg className="react-calendar-heatmap" viewBox={this.getViewBox()}>
        <g
          transform={this.getTransformForMonthLabels()}
          className={`${CSS_PSEUDO_NAMESPACE}month-labels`}
        >
          {this.renderMonthLabels()}
        </g>
        <g
          transform={this.getTransformForAllWeeks()}
          className={`${CSS_PSEUDO_NAMESPACE}all-weeks`}
        >
          {this.renderAllWeeks()}
        </g>
        <g
          transform={this.getTransformForWeekdayLabels()}
          className={`${CSS_PSEUDO_NAMESPACE}weekday-labels`}
        >
          {this.renderWeekdayLabels()}
        </g>
      </svg>
    );
  }
}

CalendarHeatmap.propTypes = {
  values: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)])
        .isRequired,
    }).isRequired,
  ).isRequired, // array of objects with date and arbitrary metadata
  numDays: PropTypes.number, // number of days back from endDate to show
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]), // start of date range
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]), // end of date range
  gutterSize: PropTypes.number, // size of space between squares
  horizontal: PropTypes.bool, // whether to orient horizontally or vertically
  showMonthLabels: PropTypes.bool, // whether to show month labels
  showWeekdayLabels: PropTypes.bool, // whether to show weekday labels
  showOutOfRangeDays: PropTypes.bool, // whether to render squares for extra days in week after endDate, and before start date
  tooltipDataAttrs: PropTypes.oneOfType([PropTypes.object, PropTypes.func]), // data attributes to add to square for setting 3rd party tooltips, e.g. { 'data-toggle': 'tooltip' } for bootstrap tooltips
  titleForValue: PropTypes.func, // function which returns title text for value
  classForValue: PropTypes.func, // function which returns html class for value
  monthLabels: PropTypes.arrayOf(PropTypes.string), // An array with 12 strings representing the text from janurary to december
  weekdayLabels: PropTypes.arrayOf(PropTypes.string), // An array with 7 strings representing the text from Sun to Sat
  onClick: PropTypes.func, // callback function when a square is clicked
  onMouseOver: PropTypes.func, // callback function when mouse pointer is over a square
  onMouseLeave: PropTypes.func, // callback function when mouse pointer is left a square
  transformDayElement: PropTypes.func, // function to further transform the svg element for a single day
  firstWeekdayMonday: PropTypes.bool, // whether to start the week from Monday instead of Sunday
  shouldPadWeekdayLabels: PropTypes.bool, // whether to pad to the left of the weekday labels
};

CalendarHeatmap.defaultProps = {
  numDays: null,
  startDate: dateNDaysAgo(200),
  endDate: new Date(),
  gutterSize: 1,
  horizontal: true,
  showMonthLabels: true,
  firstWeekdayMonday: false,
  showWeekdayLabels: false,
  shouldPadWeekdayLabels: true,
  showOutOfRangeDays: false,
  tooltipDataAttrs: null,
  titleForValue: null,
  classForValue: (value) => (value ? 'color-filled' : 'color-empty'),
  monthLabels: MONTH_LABELS,
  weekdayLabels: DAY_LABELS,
  onClick: null,
  onMouseOver: null,
  onMouseLeave: null,
  transformDayElement: null,
};

export default CalendarHeatmap;
