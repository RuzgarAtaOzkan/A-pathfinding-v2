// MODULES
import React from 'react';
import cn from 'classnames';

// STYLES
import style from './style.module.css';

class Pathfinding extends React.Component {
  constructor(props) {
    super(props);

    // constants, (declare them here and never reassign them throughout the lifecycle)

    this.UPDATE_INTERVAL_MS = 1000 / 30;

    // node colors
    this.NODE_COLOR_EMPTY = 'white';
    this.NODE_COLOR_START = 'red';
    this.NODE_COLOR_END = 'blue';
    this.NODE_COLOR_NEIGHBOUR = 'green';
    this.NODE_COLOR_PATH = 'yellow';
    this.NODE_COLOR_WALL = 'black';

    // node types
    this.NODE_TYPE_EMPTY = '0';
    this.NODE_TYPE_START = '1';
    this.NODE_TYPE_END = '2';
    this.NODE_TYPE_NEIGHBOUR = '3';
    this.NODE_TYPE_PATH = '4';
    this.NODE_TYPE_WALL = '5';

    this.NODE_SIZE = 18; //px

    // state
    this.state = {
      // mouse props
      mouse_down: false,
      // node props
      node_start: null, // child index
      node_end: null, // child index
      node_current: null, // child index
    };

    // functions
    this.start = this.start.bind(this);
    this.update = this.update.bind(this);
    this.reset = this.reset.bind(this);

    this.nodes_create = this.nodes_create.bind(this);
    this.nodes_click = this.nodes_click.bind(this);
    this.nodes_right_click = this.nodes_right_click.bind(this);
    this.nodes_mouse_down = this.nodes_mouse_down.bind(this);
    this.nodes_mouse_up = this.nodes_mouse_up.bind(this);
    this.nodes_mouse_over = this.nodes_mouse_over.bind(this);

    // refs
    this.ref_nodes = React.createRef();
  }

  start() {
    if (this.state.node_start === null || this.state.node_end === null) {
      alert('Please select start and end node');
      return;
    }

    // Calculate static values here to pass them into update for performance
    const nodes = this.ref_nodes.current.children;
    const node_start = nodes[this.state.node_start];
    const node_end = nodes[this.state.node_end];

    const nodes_column_count = parseInt(
      this.ref_nodes.current.parentNode.getBoundingClientRect().width /
        this.NODE_SIZE
    );

    const nodes_ctr_rect =
      this.ref_nodes.current.parentNode.getBoundingClientRect();

    // set the current node as the start node then keep updating the current node
    if (this.state.node_current === null) {
      this.state.node_current = this.state.node_start;
    }

    // 1. first interval for exploring walkable paths
    const interval_id_explore = setInterval(() => {
      this.update(
        node_start,
        node_end,
        nodes,
        nodes_column_count,
        nodes_ctr_rect
      );
    }, this.UPDATE_INTERVAL_MS);
  }

  update(node_start, node_end, nodes, nodes_column_count, nodes_ctr_rect) {
    const node_current = nodes[this.state.node_current];

    // current neighbours (valid html elements)
    let neighbours = [];

    // current selected node to search neighbours around
    const node_current_x = Number(node_current.getAttribute('data-x'));
    const node_current_y = Number(node_current.getAttribute('data-y'));

    // Try to find neighbours around the current node (path type) and calculate their cost values
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (i === 0 && j === 0) {
          // current selected node
          continue;
        }

        const node_neighbour_x = node_current_x + this.NODE_SIZE * j;
        const node_neighbour_y = node_current_y + this.NODE_SIZE * i;

        // check if neighbour is out of boundaries
        if (
          node_neighbour_x < 0 ||
          node_neighbour_y < 0 ||
          node_neighbour_x >= nodes_ctr_rect.width - this.NODE_SIZE ||
          node_neighbour_y >= nodes_ctr_rect.height - this.NODE_SIZE
        ) {
          continue;
        }

        const row_index =
          (node_neighbour_y / this.NODE_SIZE) * nodes_column_count;
        const column_index = node_neighbour_x / this.NODE_SIZE;
        const node_neighbour_index = row_index + column_index;

        if (nodes[node_neighbour_index]) {
          const node_x = Number(
            nodes[node_neighbour_index].getAttribute('data-x')
          );
          const node_y = Number(
            nodes[node_neighbour_index].getAttribute('data-y')
          );
          const node_type =
            nodes[node_neighbour_index].getAttribute('data-type');

          if (
            node_type !== this.NODE_TYPE_START &&
            node_type !== this.NODE_TYPE_PATH &&
            node_type !== this.NODE_TYPE_WALL
          ) {
            if (node_type === this.NODE_TYPE_END) {
              console.log('finished');
              return;
            }

            let gcost = 0;
            let hcost = 0;
            let fcost = 0;

            let distance_x = Math.abs(
              node_x - Number(node_start.getAttribute('data-x'))
            );
            let distance_y = Math.abs(
              node_y - Number(node_start.getAttribute('data-y'))
            );

            gcost = Math.sqrt(
              distance_x * distance_x + distance_y * distance_y
            );

            distance_x = Math.abs(
              node_x - Number(node_end.getAttribute('data-x'))
            );
            distance_y = Math.abs(
              node_y - Number(node_end.getAttribute('data-y'))
            );

            hcost = Math.sqrt(
              distance_x * distance_x + distance_y * distance_y
            );

            fcost = gcost + hcost;

            nodes[node_neighbour_index].setAttribute('data-gcost', gcost);
            nodes[node_neighbour_index].setAttribute('data-hcost', hcost);
            nodes[node_neighbour_index].setAttribute('data-fcost', fcost);

            /**
             * 
             * 
             *             nodes[node_neighbour_index].innerHTML =
              'g: ' +
              parseInt(gcost) +
              '<br />' +
              'h: ' +
              parseInt(hcost) +
              '<br />' +
              'f: ' +
              parseInt(fcost);
             */

            nodes[node_neighbour_index].setAttribute(
              'data-type',
              this.NODE_TYPE_NEIGHBOUR
            );
            nodes[node_neighbour_index].style.backgroundColor =
              this.NODE_COLOR_NEIGHBOUR;

            neighbours.push(nodes[node_neighbour_index]);
          }
        }
      }
    }

    // if current node surrounded with path nodes and no neighbours is around jump back into the remaining neighbours in the whole nodes
    if (neighbours.length === 0) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].getAttribute('data-type') === this.NODE_TYPE_NEIGHBOUR) {
          neighbours.push(nodes[i]);
        }
      }
    }

    // check if there are neighbours with the same fcost
    let samefcost = false;
    for (let i = 0; i < neighbours.length; i++) {
      if (samefcost) {
        break;
      }

      for (let j = 0; j < neighbours.length; j++) {
        if (i === j) {
          continue;
        }

        if (
          neighbours[i].getAttribute('data-fcost') ===
          neighbours[j].getAttribute('data-fcost')
        ) {
          samefcost = true;
          break;
        }
      }
    }

    console.log(samefcost);

    // new node choosen for current path
    let node_current_new = null;

    samefcost = false;

    if (samefcost) {
      // if there are same fcost look for the lowest gcost
      let lowestgcost = Number.MAX_SAFE_INTEGER;

      for (let i = 0; i < neighbours.length; i++) {
        if (Number(neighbours[i].getAttribute('data-gcost')) < lowestgcost) {
          node_current_new = neighbours[i];
          lowestgcost = Number(neighbours[i].getAttribute('data-gcost'));
        }
      }
    } else {
      // find the lowest fcost neighbour
      let lowestfcost = Number.MAX_SAFE_INTEGER;

      for (let i = 0; i < neighbours.length; i++) {
        if (Number(neighbours[i].getAttribute('data-fcost')) < lowestfcost) {
          node_current_new = neighbours[i];
          lowestfcost = Number(neighbours[i].getAttribute('data-fcost'));
        }
      }
    }

    node_current_new.setAttribute('data-type', this.NODE_TYPE_PATH);
    node_current_new.style.backgroundColor = this.NODE_COLOR_PATH;

    this.setState({
      ...this.state,
      node_current: Number(node_current_new.getAttribute('data-index')),
    });
  }

  reset() {}

  // cleans all the children of the nodes container and create them from scratch
  nodes_create() {
    const nodes_ctr = this.ref_nodes.current;
    const nodes_rect = nodes_ctr.getBoundingClientRect();

    // remove all children of the nodes div before creating nodes
    while (nodes_ctr.children[0]) {
      nodes_ctr.removeChild(nodes_ctr.children[0]);
    }

    // calculating how many nodes a column should have by dividing the parent element width with node size
    const column_count = parseInt(
      nodes_ctr.parentNode.getBoundingClientRect().width / this.NODE_SIZE
    );
    const node_count = column_count * 40;

    // creating nodes loop
    for (let i = 0; i < node_count; i++) {
      const node = document.createElement('div');

      node.style.width = this.NODE_SIZE + 'px';
      node.style.height = this.NODE_SIZE + 'px';

      node.classList.add(style['comppathfinding-nodes-node']);

      this.ref_nodes.current.appendChild(node);

      const node_rect = node.getBoundingClientRect();

      // give each div element a data attribute for pathfinding algorithm.
      node.setAttribute('data-index', i);
      node.setAttribute('data-x', node_rect.x - nodes_rect.x);
      node.setAttribute('data-y', node_rect.y - nodes_rect.y);
      node.setAttribute('data-type', this.NODE_TYPE_EMPTY);
    }
  }

  // for choosing a starting node by clicking on the nodes parent
  nodes_click(e) {
    // e.target gives the parent node for some reason after user moves mouse while mouse down, if it is the parent node return.
    if (e.target === this.ref_nodes.current) {
      return;
    }

    const nodes_children = this.ref_nodes.current.children;

    if (this.state.node_start !== null) {
      nodes_children[this.state.node_start].style.backgroundColor =
        this.NODE_COLOR_EMPTY;
      nodes_children[this.state.node_start].setAttribute(
        'data-type',
        this.NODE_TYPE_EMPTY
      );
    }

    const index = Number(e.target.getAttribute('data-index'));

    nodes_children[index].style.backgroundColor = this.NODE_COLOR_START;
    nodes_children[index].setAttribute('data-type', this.NODE_TYPE_START);

    console.log(e.target);

    console.log(
      this.ref_nodes.current.parentNode.getBoundingClientRect().width
    );

    if (index === this.state.node_end) {
      this.setState({
        ...this.state,
        node_start: index,
        node_end: null,
      });

      return;
    }

    this.setState({
      ...this.state,
      node_start: index,
    });
  }

  // for choosing an end node by clicking on the nodes
  nodes_right_click(e) {
    e.preventDefault();

    const nodes_children = this.ref_nodes.current.children;

    if (this.state.node_end !== null) {
      nodes_children[this.state.node_end].style.backgroundColor =
        this.NODE_COLOR_EMPTY;
      nodes_children[this.state.node_end].setAttribute(
        'data-type',
        this.NODE_TYPE_EMPTY
      );
    }

    const index = Number(e.target.getAttribute('data-index'));

    nodes_children[index].style.backgroundColor = this.NODE_COLOR_END;
    nodes_children[index].setAttribute('data-type', this.NODE_TYPE_END);

    if (index === this.state.node_start) {
      this.setState({
        ...this.state,
        node_start: null,
        node_end: index,
      });

      return;
    }

    this.setState({
      ...this.state,
      node_end: index,
    });
  }

  nodes_mouse_down(e) {
    e.preventDefault();

    this.setState({
      ...this.state,
      mouse_down: true,
    });
  }

  nodes_mouse_up(e) {
    e.preventDefault();

    this.setState({
      ...this.state,
      mouse_down: false,
    });
  }

  nodes_mouse_over(e) {
    e.preventDefault();

    if (!this.state.mouse_down) {
      return;
    }

    const type = e.target.getAttribute('data-type');

    switch (type) {
      case this.NODE_TYPE_WALL:
        e.target.setAttribute('data-type', this.NODE_TYPE_EMPTY);
        e.target.style.backgroundColor = this.NODE_COLOR_EMPTY;

        break;

      case this.NODE_TYPE_START:
        this.setState({
          ...this.state,
          node_start: null,
        });

        e.target.setAttribute('data-type', this.NODE_TYPE_WALL);
        e.target.style.backgroundColor = this.NODE_COLOR_WALL;

        break;

      case this.NODE_TYPE_END:
        this.setState({
          ...this.state,
          node_end: null,
        });

        e.target.setAttribute('data-type', this.NODE_TYPE_WALL);
        e.target.style.backgroundColor = this.NODE_COLOR_WALL;

        break;

      default:
        e.target.setAttribute('data-type', this.NODE_TYPE_WALL);
        e.target.style.backgroundColor = this.NODE_COLOR_WALL;

        break;
    }
  }

  componentDidMount() {
    this.nodes_create();

    window.addEventListener('resize', this.nodes_create);
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    window.removeEventListener('resize', this.nodes_create);
  }

  render() {
    return (
      <div className={cn(style['comppathfinding'])}>
        <div className={cn(style['comppathfinding-header'])}>
          <button
            onClick={this.start}
            className={cn(style['comppathfinding-header-btn'])}
          >
            START
          </button>

          <button
            onClick={this.reset}
            className={cn(style['comppathfinding-header-btn'])}
          >
            RESET
          </button>
        </div>

        <div
          ref={this.ref_nodes}
          className={cn(style['comppathfinding-nodes'])}
          onClick={this.nodes_click}
          onContextMenu={this.nodes_right_click}
          onMouseDown={this.nodes_mouse_down}
          onMouseUp={this.nodes_mouse_up}
          onMouseOver={this.nodes_mouse_over}
        ></div>
      </div>
    );
  }
}

export default Pathfinding;
