import lodash from 'lodash';
const { cloneDeep } = _;
import * as d3 from 'd3';

// applyTransforms.ts
/**
 * @name applyTransforms
 * @description Applies transforms to datasets
 * @param config An Optomancy config
 * @returns An object containing all transformed datasets
 */

const applyTransforms = (config, datasets) => {
  // Clone original datasets object using lodash/cloneDeep
  const transformedDatasets = cloneDeep(datasets); // TODO:
  // - Perform dataset transforms here and return transformed datasets object

  return transformedDatasets;
};

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
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
  return _extends.apply(this, arguments);
}

/**
 * @name isRootType
 * @description Type guard to check if the config passed in is of type RootType
 * @param config An optomancy config
 * @returns {boolean}
 */
function isRootType(config) {
  let key = "workspaces";
  return key in config;
}

/**
 * @name isWorkspaceType
 * @description Type guard to check if the config passed in is of type WorkspaceType
 * @param config An optomancy config
 * @returns {boolean}
 */
function isWorkspaceType(config) {
  let key = "views";
  return key in config;
}

const defaults = {
  view: {
    titlePadding: 0.1,
    width: 1,
    height: 1,
    depth: 1,
    x: 0,
    y: 0,
    z: 0,
    xrot: 0,
    yrot: 0,
    zrot: 0
  },
  mark: {
    defaultType: "point",
    types: {
      bar: {
        shape: "box"
      },
      point: {
        shape: "sphere"
      },
      line: {
        shape: "line"
      }
    },
    tooltip: {
      on: {
        content: "data"
      },
      off: false
    }
  },
  range: {
    size: [0, 0.1],
    length: [0, 0.1],
    offset: [0, 0, 1],
    rotation: [0, 360],
    color: {
      quantitative: "ramp",
      ordinal: "ordinal",
      nominal: "category",
      temporal: "ramp"
    },
    shape: ["sphere", "box", "tetrahedron", "torus", "cone"]
  },
  scheme: {
    ramp: "interpolateBlues",
    ordinal: "schemeBlues",
    category: "schemeTableau10"
  },
  scale: {
    nice: true,
    zero: true,
    paddingInner: 0.25,
    paddingOuter: 0.25
  },
  axis: {
    titlePadding: 0.1,
    filter: false,
    ticks: true,
    tickCount: 10,
    labels: true,
    face: {
      x: "front",
      y: "back",
      z: "left"
    },
    orient: {
      x: "bottom",
      y: "left",
      z: "bottom"
    }
  }
};

/**
 * @name getRanges
 * @description Get the ranges of each encoding channel from each view
 * @param view Calculate range for each encoding channel in this view
 * @return {array} Range array
 */

const getRanges = view => {
  const viewRanges = [];

  if ((view == null ? void 0 : view.encoding) !== undefined) {
    // This view doesn't have any layers so only has a single encoding object
    viewRanges.push(_getRangesFromEncoding(view.encoding));
  } else if ((view == null ? void 0 : view.layers) !== undefined) {
    // This view has layers, like onions, and ogres.
    // It has multiple encoding objects, one per layer, up to n layers.
    view.layers.forEach(layer => {
      viewRanges.push(_getRangesFromEncoding(layer.encoding));
    });
    return viewRanges;
  } else {
    // FIXME: Return error:
    // Encoding is undefined
    return [];
  }

  return viewRanges;
  /**
   * @name _getRangesFromEncoding
   * @description Gets ranges from an encoding object
   * @param encoding A view encoding object
   * @returns An range object or range object array
   */

  function _getRangesFromEncoding(encoding) {
    var _view$width, _view$height, _view$depth;

    const ranges = {};
    let channel;

    for (channel in encoding) {
      var _encoding$channel$sca;

      // Object.keys(encoding).forEach((channel) => {
      let range = []; // If a range is specified...

      if ((_encoding$channel$sca = encoding[channel].scale) != null && _encoding$channel$sca.range) {
        // ...use this range
        range = encoding[channel].scale.range;
      } else {
        // If the range is not specified, do a lookup
        switch (channel) {
          case "x":
          case "width":
            range = [0, (_view$width = view.width) != null ? _view$width : defaults.view.width];
            break;

          case "y":
          case "height":
            range = [0, (_view$height = view.height) != null ? _view$height : defaults.view.height];
            break;

          case "z":
          case "depth":
            range = [0, (_view$depth = view.depth) != null ? _view$depth : defaults.view.depth];
            break;

          case "opacity":
            range = [0, 1];
            break;

          case "size":
            range = defaults.range.size;
            break;

          case "length":
            range = defaults.range.length;
            break;

          case "color":
            // FIXME:
            range = defaults.range.color[encoding[channel].type]; // range = defaults.range.color.quantitative;

            break;

          case "shape":
            range = defaults.range.shape;
            break;

          case "xrot":
          case "yrot":
          case "zrot":
            range = defaults.range.rotation;
            break;

          case "xoffset":
          case "yoffset":
          case "zoffset":
            range = defaults.range.offset;
            break;
        }

        ranges[channel] = range;
      }
    }

    return ranges;
  }
};

/**
 * @name getDomains
 * @description Get the domains of each encoding channel from each view
 * @param view Calculate domain for each encoding channel in this view
 * @param dataset The dataset corresponding to this view
 * @return {object | array} Domain object (or domain object array)
 */

const getDomains = (view, dataset) => {
  if ((view == null ? void 0 : view.encoding) !== undefined) {
    // This view doesn't have any layers so only has a single encoding object
    return _getDomainsFromEncoding(view.encoding, dataset);
  } else if ((view == null ? void 0 : view.layers) !== undefined) {
    // This view has layers, like onions, and ogres.
    // It has multiple encoding objects, one per layer, up to n layers.
    const viewDomains = [];
    view.layers.forEach(layer => {
      viewDomains.push(_getDomainsFromEncoding(layer.encoding, dataset));
    });
    return viewDomains;
  } else {
    // FIXME: Return error:
    // Encoding is undefined
    return [];
  }
  /**
   * @name _getDomainsFromEncoding
   * @description Gets domains from an encoding object
   * @param encoding A view encoding object
   * @param dataset The dataset corresponding to this view
   * @returns An object or domain arrays
   */


  function _getDomainsFromEncoding(encoding, dataset) {
    const domains = {};
    Object.keys(encoding).forEach(channel => {
      var _encoding$channel$sca;

      let domain = []; // If a domain is specified...

      if ((_encoding$channel$sca = encoding[channel].scale) != null && _encoding$channel$sca.domain) {
        // ...use this domain
        domain = encoding[channel].scale.domain;
      } else if (encoding[channel].value) {
        // ...or use a value if specified
        domain = encoding[channel].value;
      } else {
        const values = dataset.map(row => row[encoding[channel].field]);

        switch (encoding[channel].type) {
          case "quantitative":
            // Should the domain start from zero?
            // Check upper and lower bounds, then scale.zero
            const extent = d3.extent(values);

            if (extent[0] > 0) {
              var _encoding$channel$sca2;

              // Domain lower bound greater than zero
              if (((_encoding$channel$sca2 = encoding[channel].scale) == null ? void 0 : _encoding$channel$sca2.zero) === true) {
                domain = [0, d3.max(values)];
              } else {
                domain = [...extent];
              }
            } else if (extent[1] < 0) {
              var _encoding$channel$sca3;

              // Domain upper bound less than zero
              if (((_encoding$channel$sca3 = encoding[channel].scale) == null ? void 0 : _encoding$channel$sca3.zero) === true) {
                domain = [d3.max(values), 0];
              } else {
                domain = [...extent];
              }
            } else {
              domain = [...extent];
            }

            break;

          case "temporal":
          case "nominal":
          case "ordinal":
          default:
            // Reduce the dataset to a unique set of values
            // No spreading?
            // - See: https://stackoverflow.com/a/20070691
            //   and: https://github.com/Microsoft/TypeScript/issues/8856
            domain = Array.from(new Set(values));
            break;
        }

        domains[channel] = domain;
      }
    });
    return domains;
  }
};

// createScales.ts
/**
 * @name createScales
 * @description Create scales for encoding channels in config
 * @param view Create scale for each encoding channel in this view
 * @param ranges Ranges object
 * @param domains Domains object
 * @returns An object containing all scales for all workspaces
 */

const createScales = (view, // FIXME: Consider creating CompiledViewType etc.?
ranges, domains) => {
  if ((view == null ? void 0 : view.encoding) !== undefined) {
    // This view doesn't have any layers so only has a single encoding object
    return _createScalesFromEncoding(view.encoding);
  } else if ((view == null ? void 0 : view.layers) !== undefined) {
    // This view has layers, like onions, and ogres.
    // It has multiple encoding objects, one per layer, up to n layers.
    const viewScales = [];
    view.layers.forEach(layer => {
      viewScales.push(_createScalesFromEncoding(layer.encoding));
    });
    return viewScales;
  } else {
    // FIXME: Return error:
    // Encoding is undefined
    return [];
  }
  /**
   * @name _createScalesFromEncoding
   * @description Create scales from an encoding object
   * @param encoding A view encoding object
   * @returns A scale object or scale object array
   */


  function _createScalesFromEncoding(encoding) {
    const scales = {};
    Object.keys(encoding).forEach(channel => {
      var _encoding$channel, _encoding$channel$sca, _encoding$channel$sca3, _encoding$channel2, _encoding$channel2$sc;

      // This channel's scale
      let scale; // Create scales for each channel based on encoding type

      if (encoding[channel].value) {
        // Channel value is constant
        scale = () => encoding[channel].value;
      } else {
        switch (encoding[channel].type) {
          // Quantitative field scales
          case "quantitative":
            switch (channel) {
              // Colour channel
              case "color":
                let scheme = (_encoding$channel = encoding[channel]) == null ? void 0 : (_encoding$channel$sca = _encoding$channel.scale) == null ? void 0 : _encoding$channel$sca.scheme; // If a scheme is defined, use that scheme

                if (scheme !== undefined) {
                  if (typeof scheme === "string") {
                    // Scheme is a string
                    scale = d3.scaleSequential().domain(domains[channel]).interpolator(d3[scheme]);
                  } else {
                    var _encoding$channel$sca2;

                    // Scheme is an array
                    scale = d3.scaleLinear().domain(domains[channel]).range(ranges[channel]); // Nice the scale

                    if (((_encoding$channel$sca2 = encoding[channel].scale) == null ? void 0 : _encoding$channel$sca2.nice) === true) {
                      scale = scale.nice();
                    }
                  }
                }

                break;
              // All other quantitative channels

              default:
                // Default scale
                scale = d3.scaleLinear().domain(domains[channel]).range(ranges[channel]); // Nice the scale

                if (((_encoding$channel$sca3 = encoding[channel].scale) == null ? void 0 : _encoding$channel$sca3.nice) === true) {
                  scale = scale.nice();
                }

                break;
            }

            break;

          case "nominal": // TODO: Move default case here once ordinal and temporal scales are defined

          case "ordinal": // TODO: Add ordinal scales

          case "temporal": // TODO: Add temporal scales

          default:
            // Set padding inner and outer
            // Padding outer acts as padding for scalePoint
            const paddingInner = encoding[channel].scale.paddingInner;
            const paddingOuter = encoding[channel].scale.paddingOuter; // Get type of mark

            let markType = typeof view.mark !== "string" ? view.mark.type : defaults.mark.defaultType;

            switch (channel) {
              case "x":
              case "y":
              case "z":
                switch (markType) {
                  case "bar":
                    scale = d3.scaleBand().domain(domains[channel]).paddingInner(paddingInner).paddingOuter(paddingOuter).range(ranges[channel]);
                    break;

                  case "point":
                    scale = d3.scalePoint().domain(domains[channel]).padding(paddingOuter).range(ranges[channel]);
                    break;
                }

                break;

              case "color":
                let scheme = (_encoding$channel2 = encoding[channel]) == null ? void 0 : (_encoding$channel2$sc = _encoding$channel2.scale) == null ? void 0 : _encoding$channel2$sc.scheme;

                if (scheme !== undefined) {
                  if (typeof scheme === "string") {
                    // Scheme is a string
                    scale = d3.scaleOrdinal().domain(domains[channel]).range(d3[scheme]);
                  } else {
                    // Scheme is an array
                    scale = d3.scaleOrdinal().domain(domains[channel]).range(ranges[channel]);
                  }
                }

                break;

              case "shape":
                scale = d3.scaleOrdinal().domain(domains[channel]).range(ranges[channel]);
                break;

              default:
                scale = d3.scaleOrdinal().domain(domains[channel]).range(ranges[channel]);
                break;
            }

            break;
        }
      }

      scales[channel] = scale;
    });
    return scales;
  }
};

/**
 * @name compileConfig
 * @description Infers missing config values and assigns sensible defaults
 * @param userConfig A user supplied Optomancy config
 * @param transformedDatasets Transformed datasets
 * @returns {object} A compiled config
 */

const compileConfig = (config, transformedDatasets) => {
  let compiledConfig;
  let compiledScales = []; // Convert datasets object to array of datasets for compiled config
  // This will encode datasets into compiled configs though Optomancy can instead
  // refer to datasets by name (at the view level) to its internal datasets object.

  const datasets = Object.keys(transformedDatasets).map(el => ({
    name: el,
    values: [...transformedDatasets[el]]
  })); // Re-shape config into RootType config

  if (isRootType(config)) {
    // RootType config
    compiledConfig = cloneDeep(config);
  } else if (isWorkspaceType(config)) {
    // WorkspaceType config
    // Workspace configs have just one workspace and one dataset
    compiledConfig = {
      datasets: [...datasets],
      workspaces: [_extends({}, cloneDeep(config), {
        // 0th dataset (only 1 dataset for WorkspaceType configs)
        data: datasets[0].name
      })]
    };
  } else {
    // ViewType config
    compiledConfig = {
      datasets: [...datasets],
      workspaces: [_extends({
        title: config.title,
        data: datasets[0].name
      }, config.transform && {
        transform: cloneDeep(config.transform)
      }, {
        views: [_extends({}, cloneDeep(config))]
      })]
    }; // Remove data property from view config (moved to level above)

    delete compiledConfig.workspaces[0].views[0].data; // Remove transform property from view config (moved to level above, if exists)

    delete compiledConfig.workspaces[0].views[0].transform;
  }

  compiledConfig.workspaces.forEach((workspace, w) => {
    // Add workspace array to compiled scales shape
    compiledScales.push([]); // Get name of dataset as string

    let datasetName;

    if (typeof workspace.data === "string") {
      datasetName = workspace.data;
    } else {
      // FIXME: Return error:
      // Dataset name does not match known dataset
      return;
    } // The dataset associated with this workspace


    const dataset = transformedDatasets[datasetName]; // Loop over all workspaces...

    workspace.views.forEach((view, v) => {
      // TODO: Complete all inferences:
      // - Legend
      // Add view array to compiled scales shape
      compiledScales[w].push([]);

      if ((view == null ? void 0 : view.encoding) !== undefined && (view == null ? void 0 : view.layers) === undefined) {
        // This view does not have layers so only has a single encoding object
        // Create layers object
        // FIXME: The check for layers may be redundant?
        // --------------------
        // Top level view properties: See defaults.view
        let el;

        for (el in defaults.view) {
          if (view[el] === undefined) {
            compiledConfig.workspaces[w].views[v][el] = defaults.view[el];
          }
        } // --------------------
        // Mark: See defaults.mark
        // Mark type


        let markType;

        if (typeof view.mark === "object") {
          markType = view.mark.type;
        } else {
          markType = view.mark;
        } // Mark shape


        let markShape;

        if (typeof view.mark === "object") {
          markShape = view.mark.shape;
        } else {
          markShape = defaults.mark.types[markType].shape;
        } // Mark tooltip


        let markTooltip;

        if (typeof view.mark === "object") {
          if (typeof view.mark.tooltip === "object") {
            markTooltip = view.mark.tooltip;
          } else if (view.mark.tooltip === true) {
            markTooltip = defaults.mark.tooltip.on;
          }
        } else {
          markTooltip = defaults.mark.tooltip.off;
        } // Replace existing mark config with compiled mark object


        compiledConfig.workspaces[w].views[v].mark = {
          type: markType,
          shape: markShape,
          tooltip: markTooltip
        }; // --------------------
        // Ranges
        // Ranges are calculated here as subsequent inferences require ranges

        const ranges = getRanges(view); // Add channel properties
        // Object.keys(view.encoding).forEach((el) => {

        let encoding;

        for (encoding in view.encoding) {
          let channel = view.encoding[encoding]; // TODO: Throw error if channel doesn't exist

          if (channel === undefined) return; // Config encoding object

          const enc = compiledConfig.workspaces[w].views[v].encoding[encoding]; // --------------------
          // Scale object
          // Add a scale object if one does not exist

          if (channel.scale === undefined) {
            enc.scale = {};
          } // --------------------
          // Set scale range
          // Only add range if this encoding channel is not a constant
          // No layers, so we can assert the range is at position 0


          if (channel.value === undefined) {
            // TODO:
            // I don't like this, revisit the IRange | IRange[] typing
            enc.scale.range = ranges[0][encoding];
          } // --------------------
          // Scheme
          // If this is a colour scale, it should have a scheme
          // The scheme contains a named scale range or an array of colours


          if (encoding === "color") {
            var _channel$scale, _channel$scale2;

            // If a scheme is provided, validate it
            let scheme = channel == null ? void 0 : (_channel$scale = channel.scale) == null ? void 0 : _channel$scale.scheme;
            // If the range is a string but the scheme is already set, ignore range


            if (typeof (channel == null ? void 0 : (_channel$scale2 = channel.scale) == null ? void 0 : _channel$scale2.range) === "string" && scheme === undefined) {
              enc.scale.scheme = defaults.scheme[defaults.range.color[channel.type]];
            }
          } // --------------------
          // Nice
          // Nice the scale, never nice non-quantitative scales


          if (channel.type === "quantitative" && channel.scale.nice === undefined) {
            enc.scale.nice = defaults.scale.nice;
          } // --------------------
          // Zero
          // Scale starts from zero, never zero non-quantitative scales


          if (channel.type === "quantitative" && channel.scale.zero === undefined) {
            enc.scale.zero = defaults.scale.zero;
          } // Scale padding (only x, y, or z and non-quantitative fields)


          if (["x", "y", "z"].includes(encoding) && channel.type !== "quantitative") {
            var _channel$scale3, _channel$scale4;

            // --------------------
            // Padding inner
            // Sets padding inner to band scales
            if ((channel == null ? void 0 : (_channel$scale3 = channel.scale) == null ? void 0 : _channel$scale3.paddingInner) === undefined) {
              enc.scale.paddingInner = defaults.scale.paddingInner;
            } // --------------------
            // Padding outer
            // Sets padding outer to band scales, sets padding to point scales


            if ((channel == null ? void 0 : (_channel$scale4 = channel.scale) == null ? void 0 : _channel$scale4.paddingOuter) === undefined) {
              enc.scale.paddingOuter = defaults.scale.paddingOuter;
            }
          } // --------------------
          // Axis
          // Set axis properties
          // Only applies to x, y and z channels


          if (["x", "y", "z"].includes(encoding)) {
            // Add axis object if one does not exist
            if ((channel == null ? void 0 : channel.axis) === undefined) {
              enc.axis = {};
            }

            if (channel != null && channel.axis && typeof channel.axis !== "boolean" && typeof (enc == null ? void 0 : enc.axis) !== "boolean") {
              // --------------------
              // Axis title
              // Set axis title to field name if not specified
              if (channel.axis.title === undefined) {
                enc.axis.title = channel.field;
              } // --------------------
              // Axis title padding
              // Set axis title padding if not specified


              if (channel.axis.titlePadding === undefined) {
                enc.axis.titlePadding = defaults.axis.titlePadding;
              } // --------------------
              // Axis filter
              // Set axis filter on or off


              if (channel.axis.filter === undefined) {
                enc.axis.filter = defaults.axis.filter;
              } // --------------------
              // Axis face
              // Set axis face


              if (channel.axis.face === undefined) {
                enc.axis.face = defaults.axis.face[encoding];
              } // --------------------
              // Axis orient
              // Set axis orient


              if (channel.axis.orient === undefined) {
                enc.axis.orient = defaults.axis.orient[encoding];
              } // --------------------
              // Axis ticks
              // Set axis tick visibility


              if (channel.axis.ticks === undefined) {
                enc.axis.ticks = defaults.axis.ticks;
              } // --------------------
              // Axis tick count
              // Set axis tick count


              if (channel.axis.tickCount === undefined) {
                enc.axis.tickCount = defaults.axis.tickCount;
              } // --------------------
              // Axis labels
              // Set axis label visability


              if (channel.axis.labels === undefined) {
                enc.axis.labels = defaults.axis.labels;
              }
            } // --------------------
            // Legend
            // TODO: Complete legend inference

          }
        } // });
        // --------------------
        // Domains
        // Get the domain from each encoding channel in this view


        const domains = getDomains(compiledConfig.workspaces[w].views[v], dataset); // --------------------
        // Scales
        // Using domains and ranges to produce scale functions
        // These scale functions are for mapping data and are not added to the config

        const scales = createScales(compiledConfig.workspaces[w].views[v], ranges[0], // No layers: [0]
        domains);
        compiledScales[w][v].push(scales); // Scales are exported in a 3D array:
        //   view ----------------+
        //   workspace --------v  v
        //              scales[0][0].channel
        //
        // Current Example:
        //   [  <------ workspaces
        //     [  <---- views
        //       {  <-- view
        //         x: () => {},
        //       } || [ < -- TODO: layer
        //         {
        //           x: () => {},
        //         }
        //       ]
        //     ]
        //   ]
        //
        // In Progress Example:
        //   [  <-------- workspaces
        //     [  <------ views       (workspace[w])
        //       [  <---- view        (views[w])
        //         {  <-- layer       (layers[l])
        //           x: () => {},
        //         }
        //       ]
        //     ]
        //   ]
        // Add domain to compiled config
        // This is necessary because some domains will have been niced or zeroed

        Object.keys(view.encoding).forEach(el => {
          var _view$encoding;

          let channel = (_view$encoding = view.encoding) == null ? void 0 : _view$encoding[el]; // If this encoding has a field (excluding constant channels)

          if (channel.value === undefined) {
            // Add domain to compiled config
            // Indexing 0 as there is only 1 layer per view here
            compiledConfig.workspaces[w].views[v].encoding[el].scale.domain = compiledScales[w][v][0][el].domain();
          }
        });
      } else if ((view == null ? void 0 : view.layers) !== undefined) {
        // This view has layers, like onions, and ogres.
        // It has multiple encoding objects, one per layer, up to n layers.
        view.layers.forEach((layer, k) => {// TODO: Support layer compilation
          // - This should be achieved by extracting view-level compilation
          //   into a function that accepts a layer-like object and calling
          //   it here on each layer
        });
      }
    });
  });
  return {
    config: compiledConfig,
    scales: compiledScales
  };
};

// parseDatasets.ts
/**
 * @name parseDatasets
 * @description Retrieves and parses a datasets from config
 * @param config An Optomancy config object
 * @returns An object containing all datasets associated with this config
 */

const parseDatasets = config => {
  // Dataset storage object
  const datasets = {};

  if (isRootType(config)) {
    // Using RootType config
    config.datasets.map(_parseDataConfig);
  } else {
    // Using WorkspaceType or ViewType config
    _parseDataConfig(config == null ? void 0 : config.data);
  }
  /**
   * @name _parseDataConfig
   * @description Parses the data portion of config
   * @param configData Data portion of config
   * @private
   */


  function _parseDataConfig(configData) {
    if (typeof configData === "string") {
      // Data is a string
      // Check list of datasets to see if this is a reference first
      if (!datasets.hasOwnProperty(configData)) {
        // Dataset is a url
        _loadDatasetFromURL(configData);
      }
    } else {
      // Data object
      // If data object has a url and/or name
      if (configData != null && configData.url && configData != null && configData.name) {
        // Dataset is a url with a name
        // { url: 'something', name: 'something' }
        _loadDatasetFromURL(configData.url);
      } else if (configData != null && configData.url) {
        // Dataset is a url
        // { url: 'something' }
        _loadDatasetFromURL(configData.url);
      } else if (configData != null && configData.values) {
        // Dataset is a JSON array
        if (configData != null && configData.name) {
          // If a name is supplied, store with this name
          // { values: [], name: 'something' }
          datasets[configData.name] = [...configData.values];
        } else {
          // If a name is not supplied, use default
          // { values: [], name: "dataset{n}" }
          let countDatasets = Object.keys(datasets).length + 1;
          datasets[`dataset${countDatasets}`] = [...configData.values];
        }
      }
    }
  }
  /**
   * @name _loadDatasetFromURL
   * @description Load a dataset from a URL
   * @param url URL of dataset to load
   * @param name {optional} Name of dataset
   * @private
   */


  function _loadDatasetFromURL(url, name) {
    // Get file type
    url.split(".").pop().toLowerCase(); // Check if file type is supported
    // let countDatasets = Object.keys(datasets).length + 1;
    // datasets[`dataset${countDatasets}`] = [...];

  }

  return datasets;
};

// parseConfig.ts
/**
 * @name parseConfig
 * @description Parses an Optomancy config
 * @param userConfig An Optomancy config
 * @returns {object} A compiled optomancy config, datasets and scales
 */

const parseConfig = userConfig => {
  // 1) Validate config
  // TODO:
  // - Validate config before parsing
  //   Use AJV or equivalent against an Optomancy config JSON schema
  // 2) Retrieve and parse datasets
  const datasets = parseDatasets(userConfig); // 3) Apply dataset transforms

  const transformedDatasets = applyTransforms(userConfig, datasets); // 4) Infer config defaults, producing compiled config and a set of scales

  const {
    config,
    scales
  } = compileConfig(userConfig, transformedDatasets); // 5) Export transformed datasets, scales, compiled config and meta data

  return {
    datasets: transformedDatasets,
    config,
    scales
  };
};

var ConfigType = {
  __proto__: null
};

var RootType = {
  __proto__: null
};

var WorkspaceType = {
  __proto__: null
};

//type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

var DataType = {
  __proto__: null
};

var ViewType = {
  __proto__: null
};

var LayerType = {
  __proto__: null
};

var AxisType = {
  __proto__: null
};

var ChannelType = {
  __proto__: null
};

var EncodingType = {
  __proto__: null
};

var LegendType = {
  __proto__: null
};

var MarkType = {
  __proto__: null
};

var ScaleType = {
  __proto__: null
};

var TooltipType = {
  __proto__: null
};

var TransformType = {
  __proto__: null
};

class Optomancy {
  // TODO: Check this ---------------------vvvvvvvvvvvvv
  constructor(userConfig) {
    this.userConfig = void 0;
    this.datasets = void 0;
    this.config = void 0;
    this.scales = void 0;
    this.parseConfig = void 0;
    window.d3 = d3;
    // console.log("\n*_.-'Optomancy Started'-._*\n\n");
    // console.log(`Started at: ${new Date()}`);
    this.userConfig = userConfig;
    const {
      datasets,
      config,
      scales
    } = parseConfig(this.userConfig);
    this.datasets = datasets;
    this.config = config;
    this.scales = scales;
    this.parseConfig = parseConfig;
  }

} // Optomancy Config Types

export { AxisType as Axis, ChannelType as Channel, ConfigType as Config, DataType as Data, EncodingType as Encoding, LayerType as Layer, LegendType as Legend, MarkType as Mark, Optomancy, RootType as Root, ScaleType as Scale, TooltipType as Tooltip, TransformType as Transform, ViewType as View, WorkspaceType as Workspace };
