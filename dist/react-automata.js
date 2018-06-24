'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var invariant = _interopDefault(require('invariant'));
var React = _interopDefault(require('react'));
var PropTypes = _interopDefault(require('prop-types'));
var globToRegExp = _interopDefault(require('glob-to-regexp'));
var xstate = require('xstate');
var TestRenderer = _interopDefault(require('react-test-renderer'));
var graph = require('xstate/lib/graph');

var getContextValue = function getContextValue(context, name) {
  invariant(context.automata, 'No context received.');

  var channel = name || 'DEFAULT';
  var value = context.automata[channel];

  invariant(value, 'No value for channel: "%s".', channel);

  return value;
};

var getComponentName = function getComponentName(Component) {
  return Component.displayName || Component.name || 'Component';
};

var isStateless = function isStateless(Component) {
  var _ref;

  return !((_ref = Component) != null ? (_ref = _ref.prototype) != null ? _ref.isReactComponent : _ref : _ref);
};

var stringify = function stringify(state) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (typeof state === 'string') {
    return path.concat(state).join('.');
  }

  return Object.keys(state).reduce(function (prev, key) {
    return prev.concat(stringify(state[key], path.concat(key)));
  }, []);
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var createConditional = function createConditional(_ref) {
  var displayName = _ref.displayName,
      propTypes = _ref.propTypes,
      shouldShow = _ref.shouldShow,
      shouldHide = _ref.shouldHide;

  var Conditional = function (_React$Component) {
    inherits(Conditional, _React$Component);

    function Conditional(props, context) {
      classCallCheck(this, Conditional);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props, context));

      var value = getContextValue(context, props.channel);

      _this.state = {
        visible: shouldShow(props, value)
      };

      if (_this.state.visible && props.onShow) {
        props.onShow();
      }
      return _this;
    }

    Conditional.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps, nextContext) {
      var value = getContextValue(nextContext, nextProps.channel);

      if (!this.state.visible && shouldShow(nextProps, value)) {
        this.setState({
          visible: true
        });

        if (nextProps.onShow) {
          nextProps.onShow();
        }
      }

      if (this.state.visible && shouldHide(nextProps, value)) {
        this.setState({
          visible: false
        });

        if (nextProps.onHide) {
          nextProps.onHide();
        }
      }
    };

    Conditional.prototype.render = function render() {
      if (typeof this.props.render === 'function') {
        return this.props.render(this.state.visible);
      }

      return this.state.visible ? this.props.children : null;
    };

    return Conditional;
  }(React.Component);

  Conditional.displayName = displayName;

  Conditional.contextTypes = {
    automata: PropTypes.object
  };

  process.env.NODE_ENV !== "production" ? Conditional.propTypes = _extends({}, propTypes, {
    channel: PropTypes.string,
    children: PropTypes.node,
    render: PropTypes.func,
    onHide: PropTypes.func,
    onShow: PropTypes.func
  }) : void 0;

  Conditional.defaultProps = {
    children: null
  };

  return Conditional;
};

var displayName = 'Action';

var propTypes = {
  hide: /*#__PURE__*/PropTypes.oneOfType([/*#__PURE__*/PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  show: /*#__PURE__*/PropTypes.oneOfType([/*#__PURE__*/PropTypes.arrayOf(PropTypes.string), PropTypes.string])
};

var matches = function matches(value, actions) {
  return Array.isArray(value) ? actions.some(function (action) {
    return value.includes(action);
  }) : actions.includes(value);
};

var shouldShow = function shouldShow(props, context) {
  return matches(props.show, context.actions);
};

var shouldHide = function shouldHide(props, context) {
  return props.hide ? matches(props.hide, context.actions) : !matches(props.show, context.actions);
};

var Action = /*#__PURE__*/createConditional({
  displayName: displayName,
  propTypes: process.env.NODE_ENV !== 'production' ? propTypes : null,
  shouldShow: shouldShow,
  shouldHide: shouldHide
});

var displayName$1 = 'State';

var propTypes$1 = {
  value: /*#__PURE__*/PropTypes.oneOfType([/*#__PURE__*/PropTypes.arrayOf(PropTypes.string), PropTypes.string])
};

var matches$1 = function matches(value, machineState) {
  var values = Array.isArray(value) ? value : [value];
  var states = Array.isArray(machineState) ? machineState : [machineState];

  return values.some(function (val) {
    var matcher = globToRegExp(val);
    return states.some(function (state) {
      return matcher.test(state);
    });
  });
};

var shouldShow$1 = function shouldShow(props, context) {
  return matches$1(props.value, context.machineState);
};

var shouldHide$1 = function shouldHide(props, context) {
  return !matches$1(props.value, context.machineState);
};

var State = /*#__PURE__*/createConditional({
  displayName: displayName$1,
  propTypes: process.env.NODE_ENV !== 'production' ? propTypes$1 : null,
  shouldShow: shouldShow$1,
  shouldHide: shouldHide$1
});

var withStatechart = function withStatechart(statechart) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (Component) {
    var StateMachine = function (_React$Component) {
      inherits(StateMachine, _React$Component);

      function StateMachine() {
        var _temp, _this, _ret;

        classCallCheck(this, StateMachine);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.machine = statechart instanceof xstate.StateNode ? statechart : xstate.Machine(statechart), _this.state = {
          componentState: _this.props.initialData,
          machineState: _this.props.initialMachineState || _this.machine.initialState
        }, _this.setInstance = function (element) {
          _this.instance = element;
        }, _this.handleRef = !isStateless(Component) ? _this.setInstance : null, _this.handleTransition = function (event, updater) {
          var _ref;

          invariant(!_this.isTransitioning, 'Cannot transition on "%s" in the middle of a transition on "%s".', event, _this.lastEvent);

          _this.lastEvent = event;
          _this.isTransitioning = true;

          if ((_ref = _this) != null ? (_ref = _ref.instance) != null ? _ref.componentWillTransition : _ref : _ref) {
            _this.instance.componentWillTransition(event);
          }

          _this.setState(function (prevState) {
            var stateChange = typeof updater === 'function' ? updater(prevState.componentState) : updater;
            var nextState = _this.machine.transition(prevState.machineState, event, stateChange);

            return {
              componentState: _extends({}, prevState.componentState, stateChange),
              event: event,
              machineState: nextState
            };
          });
        }, _temp), possibleConstructorReturn(_this, _ret);
      }

      StateMachine.prototype.getChildContext = function getChildContext() {
        var _babelHelpers$extends;

        var channel = options.channel || 'DEFAULT';

        return {
          automata: _extends({}, this.context.automata, (_babelHelpers$extends = {}, _babelHelpers$extends[channel] = {
            actions: this.state.machineState.actions,
            machineState: this.state.machineState.toString() || stringify(this.state.machineState.value)
          }, _babelHelpers$extends))
        };
      };

      StateMachine.prototype.componentDidMount = function componentDidMount() {
        var _this2 = this;

        if (options.devTools && window.__REDUX_DEVTOOLS_EXTENSION__) {
          this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
            name: getComponentName(Component)
          });
          this.devTools.init(this.state);

          this.unsubscribe = this.devTools.subscribe(function (message) {
            if (message.type === 'DISPATCH' && message.payload.type === 'JUMP_TO_ACTION') {
              _this2.jumpToAction = true;
              _this2.setState(JSON.parse(message.state));
            }
          });
        }

        this.runActionMethods();
      };

      StateMachine.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this.unsubscribe) {
          this.unsubscribe();
        }

        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
          window.__REDUX_DEVTOOLS_EXTENSION__.disconnect();
        }
      };

      StateMachine.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
        if (!this.jumpToAction) {
          this.handleComponentDidUpdate(prevProps, prevState);
        } else {
          this.jumpToAction = false;
        }
      };

      StateMachine.prototype.runActionMethods = function runActionMethods() {
        var _this3 = this;

        if (this.instance) {
          this.state.machineState.actions.forEach(function (action) {
            if (_this3.instance[action]) {
              _this3.instance[action]();
            }
          });
        }
      };

      StateMachine.prototype.handleComponentDidUpdate = function handleComponentDidUpdate(prevProps, prevState) {
        if (prevState.machineState.actions !== this.state.machineState.actions) {
          this.runActionMethods();
        }

        if (prevState.machineState !== this.state.machineState) {
          var _ref2;

          if ((_ref2 = this) != null ? (_ref2 = _ref2.instance) != null ? _ref2.componentDidTransition : _ref2 : _ref2) {
            this.instance.componentDidTransition(prevState.machineState, this.state.event);
          }

          if (this.devTools) {
            this.devTools.send(this.state.event, this.state);
          }
        }

        this.isTransitioning = false;
      };

      StateMachine.prototype.render = function render() {
        return React.createElement(Component, _extends({}, this.props, this.state.componentState, {
          machineState: this.state.machineState,
          ref: this.handleRef,
          transition: this.handleTransition
        }));
      };

      return StateMachine;
    }(React.Component);

    process.env.NODE_ENV !== "production" ? StateMachine.propTypes = {
      initialData: PropTypes.object,
      initialMachineState: PropTypes.instanceOf(xstate.State)
    } : void 0;

    StateMachine.contextTypes = {
      automata: PropTypes.object
    };

    StateMachine.childContextTypes = {
      automata: PropTypes.object
    };

    StateMachine.isStateMachine = true;

    return StateMachine;
  };
};

var testStatechart = function testStatechart(options, Component) {
  invariant(!Component.isStateMachine, 'It seems you are testing a component wrapped into `withStatechart`, please use a base component instead.\n    See https://github.com/MicheleBertoli/react-automata/issues/46');

  var statechart = options.statechart,
      extendedState = options.extendedState,
      channel = options.channel;

  var machine = xstate.Machine(statechart);
  var paths = graph.getShortestPaths(machine, extendedState);

  Object.keys(paths).forEach(function (key) {
    var _ref2;

    var initialData = (_ref2 = options) != null ? (_ref2 = _ref2.fixtures) != null ? _ref2.initialData : _ref2 : _ref2;
    var StateMachine = withStatechart(statechart, { channel: channel })(Component);
    var renderer = TestRenderer.create(React.createElement(StateMachine, { initialData: initialData }));
    var instance = renderer.getInstance();

    paths[key].forEach(function (_ref3) {
      var _ref;

      var event = _ref3.event,
          state = _ref3.state;

      var fixtures = (_ref = options) != null ? (_ref = _ref.fixtures) != null ? (_ref = _ref[state]) != null ? _ref[event] : _ref : _ref : _ref;

      instance.handleTransition(event, fixtures);
    });

    var _getContextValue = getContextValue(instance.getChildContext(), channel),
        machineState = _getContextValue.machineState;

    expect(renderer.toJSON()).toMatchSnapshot(undefined, machineState);
  });
};

exports.Action = Action;
exports.State = State;
exports.testStatechart = testStatechart;
exports.withStatechart = withStatechart;
