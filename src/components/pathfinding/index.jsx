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
      node_current: null,
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

    const node_start = this.ref_nodes.current.children[this.state.node_start];
    const node_end = this.ref_nodes.current.children[this.state.node_end];

    // set the current node as the start node then keep updating the current node
    if (this.state.node_current === null) {
      this.state.node_current = this.state.node_start;
    }

    const interval_id = setInterval(() => {
      this.update(node_start, node_end);
    }, this.UPDATE_INTERVAL_MS);
  }

  update(node_start, node_end) {
    const node_current =
      this.ref_nodes.current.children[this.state.node_current];

    // current neighbours (valid html elements)
    let neighbours = [];
    const current_x = Number(node_current.getAttribute('data-x'));
    const current_y = Number(node_current.getAttribute('data-y'));

    // Try to find neighbours around the current node
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (i === 0 && j === 0) {
          // current selected node
          continue;
        }

        const neighbour_x = current_x + this.NODE_SIZE * j;
        const neighbour_y = current_y + this.NODE_SIZE * i;

        const nodes = this.ref_nodes.current.children;

        for (let k = 0; k < nodes.length; k++) {
          const node_x = Number(nodes[k].getAttribute('data-x'));
          const node_y = Number(nodes[k].getAttribute('data-y'));
          const node_type = nodes[k].getAttribute('data-type');

          if (
            node_x === neighbour_x &&
            node_y === neighbour_y &&
            node_type !== this.NODE_TYPE_START &&
            node_type !== this.NODE_TYPE_PATH &&
            node_type !== this.NODE_TYPE_WALL
          ) {
            // new neighbour data set

            if (
              node_x === neighbour_x &&
              node_y === neighbour_y &&
              node_type === this.NODE_TYPE_END
            ) {
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

            // the ones on the diagonal corners
            if (distance_x && distance_y) {
              gcost = Math.sqrt(
                distance_x * distance_x + distance_y * distance_y
              );
            } else {
              gcost = distance_x + distance_y;
            }

            distance_x = Math.abs(
              node_x - Number(node_end.getAttribute('data-x'))
            );
            distance_y = Math.abs(
              node_y - Number(node_end.getAttribute('data-y'))
            );

            if (distance_x && distance_y) {
              hcost = Math.sqrt(
                distance_x * distance_x + distance_y * distance_y
              );
            } else {
              hcost = distance_x + distance_y;
            }

            fcost = gcost + hcost;

            nodes[k].setAttribute('data-gcost', gcost);
            nodes[k].setAttribute('data-hcost', hcost);
            nodes[k].setAttribute('data-fcost', fcost);

            /**
             *             nodes[k].innerHTML =
              'g:' +
              parseInt(gcost) +
              '<br />' +
              'h:' +
              parseInt(hcost) +
              '<br />' +
              'f:' +
              parseInt(fcost);
             * 
             */

            nodes[k].setAttribute('data-type', this.NODE_TYPE_NEIGHBOUR);
            nodes[k].style.backgroundColor = this.NODE_COLOR_NEIGHBOUR;

            neighbours.push(nodes[k]);
          }
        }
      }
    }

    // if current node surrounded with path nodes and neighbours is empty jump back into the remaining neighbours
    if (neighbours.length === 0) {
      for (let i = 0; i < this.ref_nodes.current.children.length; i++) {
        if (
          this.ref_nodes.current.children[i].getAttribute('data-type') ===
          this.NODE_TYPE_NEIGHBOUR
        ) {
          neighbours.push(this.ref_nodes.current.children[i]);
        }
      }
    }

    for (let i = 0; i < neighbours.length; i++) {
      for (let j = 0; j < neighbours.length; j++) {
        if (neighbours[j + 1]) {
          const current = neighbours[j];
          const next = neighbours[j + 1];

          if (
            Number(current.getAttribute('data-fcost')) >
            Number(next.getAttribute('data-fcost'))
          ) {
            neighbours[j] = next;
            neighbours[j + 1] = current;
          }
        }
      }
    }

    if (!neighbours[0]) {
      return;
    }

    neighbours[0].setAttribute('data-type', this.NODE_TYPE_PATH);
    neighbours[0].style.backgroundColor = this.NODE_COLOR_PATH;

    this.setState({
      ...this.state,
      node_current: Number(neighbours[0].getAttribute('data-index')),
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
