// Visualization and Animation Logic

let currentArrayContainer = null;
let currentArrayData = [];
let currentLinkedListData = [];
let arrayState = {
    highlightIndex: null,
    searchValue: null,
    message: '',
};
let linkedListState = {
    highlightIndex: null,
    foundIndex: null,
    message: '',
    type: 'singly',
};
let visualizationState = {
    highlightIndex: null,
    highlightIndices: [],
    pivotIndex: null,
    leftIndex: null,
    rightIndex: null,
    lowIndex: null,
    highIndex: null,
    searchValue: null,
    message: '',
    mode: 'boxes',
};
let currentVisualizationType = null;
let currentLinkedListType = null;
let animationTimeouts = [];

function clearAnimationTimeouts() {
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];
}

function createVisualization(type, data, options = {}) {
    const container = document.getElementById('visualization');
    if (!container) return;

    clearAnimationTimeouts();
    currentArrayContainer = container;
    currentArrayData = data.slice();
    currentVisualizationType = type;

    if (type === 'array') {
        arrayState = {
            highlightIndex: null,
            searchValue: null,
            message: options.message || 'Array ready for operations.',
        };
    }

    if (type === 'linkedlist') {
        currentLinkedListData = data.slice();
        currentLinkedListType = options.mode || 'singly';
        linkedListState = {
            highlightIndex: null,
            foundIndex: null,
            message: options.message || 'Linked list ready for operations.',
            type: currentLinkedListType,
        };
    }

    visualizationState = {
        highlightIndex: null,
        highlightIndices: [],
        pivotIndex: null,
        leftIndex: null,
        rightIndex: null,
        lowIndex: null,
        highIndex: null,
        searchValue: null,
        message: options.message || '',
        mode: options.mode || 'boxes',
    };

    renderCurrentVisualization();
}

function renderCurrentVisualization() {
    if (!currentArrayContainer) return;

    switch (currentVisualizationType) {
        case 'array':
            visualizeArray(currentArrayContainer, currentArrayData, visualizationState);
            break;
        case 'sorting':
            visualizeSorting(currentArrayContainer, currentArrayData, visualizationState);
            break;
        case 'search':
            visualizeSearch(currentArrayContainer, currentArrayData, visualizationState);
            break;
        case 'linkedlist':
            visualizeLinkedList(currentArrayContainer, currentLinkedListData, linkedListState);
            break;
        default:
            console.log('Unknown visualization type', currentVisualizationType);
    }
}

function visualizeArray(container, data, state) {
    container.innerHTML = '<div class="array-visualization"></div>';
    const viz = container.querySelector('.array-visualization');

    data.forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'array-item';
        element.textContent = item;
        if (state.highlightIndex === index) {
            element.classList.add('highlight');
        }
        if (state.searchValue !== null && state.searchValue !== '' && String(item) === String(state.searchValue)) {
            element.classList.add('search-hit');
        }
        viz.appendChild(element);
    });

    updateArrayMessage(state.message || 'Array visualization updated.');
}

function visualizeSearch(container, data, state) {
    container.innerHTML = '<div class="array-visualization"></div>';
    const viz = container.querySelector('.array-visualization');

    data.forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'array-item';
        element.textContent = item;
        if (state.highlightIndex === index) {
            element.classList.add('highlight');
        }
        if (state.searchValue !== null && state.searchValue !== '' && String(item) === String(state.searchValue)) {
            element.classList.add('search-hit');
        }
        if (index === state.lowIndex || index === state.highIndex || index === state.pivotIndex) {
            element.classList.add('range');
        }
        viz.appendChild(element);
    });

    updateArrayMessage(state.message || 'Search visualization updated.');
}

function visualizeSorting(container, data, state) {
    container.innerHTML = '<div class="sorting-visualization"></div>';
    const viz = container.querySelector('.sorting-visualization');

    data.forEach((item, index) => {
        const bar = document.createElement('div');
        bar.className = 'sort-bar';
        bar.style.height = `${Math.max(24, Number(item) * 10)}px`;
        bar.dataset.value = item;
        if (state.highlightIndices?.includes(index)) {
            bar.classList.add('highlight');
        }
        if (index === state.pivotIndex) {
            bar.classList.add('pivot');
        }
        if (index === state.leftIndex) {
            bar.classList.add('left');
        }
        if (index === state.rightIndex) {
            bar.classList.add('right');
        }
        viz.appendChild(bar);
    });

    updateArrayMessage(state.message || 'Sorting visualization updated.');
}

function visualizeLinkedList(container, data, state) {
    container.innerHTML = '<div class="linkedlist-visualization"></div>';
    const viz = container.querySelector('.linkedlist-visualization');

    if (!data.length) {
        viz.innerHTML = '<div class="list-empty">Empty linked list</div>';
        updateArrayMessage(state.message || 'Linked list is empty.');
        return;
    }

    data.forEach((item, index) => {
        const node = document.createElement('div');
        node.className = 'list-node';
        if (state.highlightIndex === index) {
            node.classList.add('highlight');
        }
        if (state.foundIndex === index) {
            node.classList.add('found');
        }

        const value = document.createElement('div');
        value.className = 'node-value';
        value.textContent = item;
        node.appendChild(value);
        viz.appendChild(node);

        const isLast = index === data.length - 1;
        if (state.type === 'doubly') {
            const edge = document.createElement('div');
            edge.className = 'node-edge';
            edge.textContent = '↔';
            viz.appendChild(edge);
        } else if (!isLast || state.type === 'circular') {
            const edge = document.createElement('div');
            edge.className = 'node-edge' + (isLast && state.type === 'circular' ? ' circular' : '');
            edge.textContent = isLast && state.type === 'circular' ? '↺' : '→';
            viz.appendChild(edge);
        }
    });

    updateArrayMessage(state.message || 'Linked list visualization updated.');
}

function updateArrayMessage(message) {
    const messageEl = document.getElementById('arrayMessage');
    if (!messageEl) return;
    messageEl.textContent = message;
}

function updateLinkedListVisualization(options = {}) {
    if (!currentArrayContainer) return;
    linkedListState = { ...linkedListState, ...options };
    visualizeLinkedList(currentArrayContainer, currentLinkedListData, linkedListState);
}

function updateArrayVisualization(options = {}) {
    if (!currentArrayContainer) return;
    arrayState = { ...arrayState, ...options };
    visualizeArray(currentArrayContainer, currentArrayData, arrayState);
}

function updateVisualization(options = {}) {
    if (!currentArrayContainer) return;
    visualizationState = { ...visualizationState, ...options };
    renderCurrentVisualization();
}

function accessArrayIndex(index) {
    const parsed = Number(index);
    if (Number.isNaN(parsed) || parsed < 0 || parsed >= currentArrayData.length) {
        updateArrayMessage('Invalid index. Enter a number between 0 and ' + (currentArrayData.length - 1) + '.');
        return;
    }
    updateArrayVisualization({ highlightIndex: parsed, searchValue: null, message: `Accessed index ${parsed}: value ${currentArrayData[parsed]}.` });
}

function insertArrayValue(value, index) {
    const parsed = Number(index);
    if (!value) {
        updateArrayMessage('Enter a value to insert.');
        return;
    }
    if (Number.isNaN(parsed) || parsed < 0 || parsed > currentArrayData.length) {
        updateArrayMessage('Invalid target index. Use a number from 0 to ' + currentArrayData.length + '.');
        return;
    }
    currentArrayData.splice(parsed, 0, value);
    updateArrayVisualization({ highlightIndex: parsed, searchValue: null, message: `Inserted ${value} at index ${parsed}.` });
}

function deleteArrayIndex(index) {
    const parsed = Number(index);
    if (Number.isNaN(parsed) || parsed < 0 || parsed >= currentArrayData.length) {
        updateArrayMessage('Invalid index. Enter a number between 0 and ' + (currentArrayData.length - 1) + '.');
        return;
    }
    const removed = currentArrayData.splice(parsed, 1)[0];
    updateArrayVisualization({ highlightIndex: null, searchValue: null, message: `Deleted value ${removed} from index ${parsed}.` });
}

function searchArrayValue(value) {
    if (value === '') {
        updateArrayMessage('Enter a value to search for.');
        return;
    }
    const hits = currentArrayData.reduce((count, item) => count + (String(item) === String(value) ? 1 : 0), 0);
    if (!hits) {
        updateArrayVisualization({ highlightIndex: null, searchValue: value, message: `Value ${value} was not found in the array.` });
        return;
    }
    updateArrayVisualization({ highlightIndex: null, searchValue: value, message: `Found ${hits} occurrence(s) of value ${value}.` });
}

function insertLinkedListHead(value) {
    if (!value) {
        updateArrayMessage('Enter a value to insert.');
        return;
    }
    currentLinkedListData.unshift(value);
    updateLinkedListVisualization({ highlightIndex: 0, foundIndex: null, message: `Inserted ${value} at the head of the list.` });
}

function insertLinkedListTail(value) {
    if (!value) {
        updateArrayMessage('Enter a value to insert.');
        return;
    }
    currentLinkedListData.push(value);
    updateLinkedListVisualization({ highlightIndex: currentLinkedListData.length - 1, foundIndex: null, message: `Inserted ${value} at the tail of the list.` });
}

function deleteLinkedListValue(value) {
    if (!value) {
        updateArrayMessage('Enter a value to delete.');
        return;
    }
    const index = currentLinkedListData.indexOf(value);
    if (index === -1) {
        updateLinkedListVisualization({ highlightIndex: null, foundIndex: null, message: `Value ${value} was not found in the list.` });
        return;
    }
    currentLinkedListData.splice(index, 1);
    updateLinkedListVisualization({ highlightIndex: null, foundIndex: null, message: `Deleted ${value} from the list.` });
}

function searchLinkedListValue(value) {
    if (!value) {
        updateArrayMessage('Enter a value to search for.');
        return;
    }
    const index = currentLinkedListData.indexOf(value);
    if (index === -1) {
        updateLinkedListVisualization({ highlightIndex: null, foundIndex: null, message: `${value} was not found in the list.` });
        return;
    }
    animateLinkedListTraversal('search', index, value);
}

function animateLinkedListTraversal(mode = 'forward', targetIndex = null, targetValue = null) {
    if (!currentLinkedListData.length) {
        updateLinkedListVisualization({ message: 'The list is empty.' });
        return;
    }

    let sequence = [];
    if (mode === 'backward') {
        for (let i = currentLinkedListData.length - 1; i >= 0; i--) {
            sequence.push(i);
        }
    } else {
        for (let i = 0; i < currentLinkedListData.length; i++) {
            sequence.push(i);
        }
    }

    if (mode === 'search' && targetIndex !== null) {
        sequence = [targetIndex];
    }

    let delay = 0;
    createVisualization('linkedlist', currentLinkedListData, { mode: currentLinkedListType, message: 'Traversing the linked list...' });
    sequence.forEach((index, step) => {
        animationTimeouts.push(setTimeout(() => {
            const nodeValue = currentLinkedListData[index];
            updateLinkedListVisualization({
                highlightIndex: index,
                foundIndex: mode === 'search' && targetIndex === index ? index : null,
                message: mode === 'search'
                    ? `Found ${targetValue} at node ${index}.`
                    : `Visited node ${index}: ${nodeValue}.`,
            });
        }, delay));
        delay += 700;
    });

    if (currentLinkedListType === 'circular' && mode !== 'search') {
        animationTimeouts.push(setTimeout(() => {
            updateLinkedListVisualization({ highlightIndex: 0, foundIndex: null, message: 'Circular traversal continues back to the head.' });
        }, delay));
    }
}

function animateLinkedListSearch(value) {
    const index = currentLinkedListData.indexOf(value);
    if (index === -1) {
        animateLinkedListTraversal('forward');
        animationTimeouts.push(setTimeout(() => {
            updateLinkedListVisualization({ message: `${value} was not found in the list.`, highlightIndex: null, foundIndex: null });
        }, currentLinkedListData.length * 700));
        return;
    }
    animateLinkedListTraversal('search', index, value);
}

function animateBubbleSort(initialData) {
    const data = initialData.slice();
    createVisualization('sorting', data, { message: 'Bubble Sort will compare adjacent values and swap them until sorted.' });
    const n = data.length;
    let delay = 0;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            const currentJ = j;
            const nextJ = j + 1;
            animationTimeouts.push(setTimeout(() => {
                const a = data[currentJ];
                const b = data[nextJ];
                if (Number(a) > Number(b)) {
                    data[currentJ] = b;
                    data[nextJ] = a;
                    currentArrayData = data.slice();
                    updateVisualization({
                        highlightIndices: [currentJ, nextJ],
                        message: `Swapped ${a} and ${b}.`,
                    });
                } else {
                    updateVisualization({
                        highlightIndices: [currentJ, nextJ],
                        message: `Compared ${a} and ${b}: no swap needed.`,
                    });
                }
            }, delay));
            delay += 900;
        }
    }

    animationTimeouts.push(setTimeout(() => {
        updateVisualization({ highlightIndices: [], message: 'Bubble Sort complete! The array is now sorted.' });
    }, delay));
}

function animateInsertionSort(initialData) {
    const data = initialData.slice();
    createVisualization('sorting', data, { message: 'Insertion Sort builds a sorted subarray by inserting one element at a time.' });
    let delay = 0;

    for (let i = 1; i < data.length; i++) {
        const key = data[i];
        let j = i - 1;
        animationTimeouts.push(setTimeout(() => {
            updateVisualization({
                highlightIndices: [i],
                message: `Select ${key} and compare it with sorted elements to its left.`,
            });
        }, delay));
        delay += 900;

        while (j >= 0 && Number(data[j]) > Number(key)) {
            const currentJ = j;
            animationTimeouts.push(setTimeout(() => {
                data[currentJ + 1] = data[currentJ];
                currentArrayData = data.slice();
                updateVisualization({
                    highlightIndices: [currentJ, currentJ + 1],
                    message: `Shift ${data[currentJ]} right to open space for ${key}.`,
                });
            }, delay));
            j -= 1;
            delay += 900;
        }

        animationTimeouts.push(setTimeout(() => {
            data[j + 1] = key;
            currentArrayData = data.slice();
            updateVisualization({
                highlightIndices: [j + 1],
                message: `Insert ${key} at index ${j + 1}.`,
            });
        }, delay));
        delay += 900;
    }

    animationTimeouts.push(setTimeout(() => {
        updateVisualization({ highlightIndices: [], message: 'Insertion Sort complete! The array is sorted.' });
    }, delay));
}

function animateSelectionSort(initialData) {
    const data = initialData.slice();
    createVisualization('sorting', data, { message: 'Selection Sort repeatedly finds the smallest remaining value and moves it to the front.' });
    let delay = 0;

    for (let i = 0; i < data.length - 1; i++) {
        let min = i;
        for (let j = i + 1; j < data.length; j++) {
            const currentJ = j;
            const currentMin = min;
            animationTimeouts.push(setTimeout(() => {
                if (Number(data[currentJ]) < Number(data[currentMin])) {
                    min = currentJ;
                    updateVisualization({
                        highlightIndices: [i, currentJ],
                        leftIndex: i,
                        rightIndex: currentJ,
                        message: `Found new minimum ${data[currentJ]} at index ${currentJ}.`,
                    });
                } else {
                    updateVisualization({
                        highlightIndices: [i, currentJ],
                        leftIndex: i,
                        rightIndex: currentMin,
                        message: `Compare ${data[currentJ]} with current minimum ${data[currentMin]}.`,
                    });
                }
            }, delay));
            delay += 900;
        }

        const selectedMin = min;
        animationTimeouts.push(setTimeout(() => {
            if (selectedMin !== i) {
                const temp = data[i];
                data[i] = data[selectedMin];
                data[selectedMin] = temp;
                currentArrayData = data.slice();
                updateVisualization({
                    highlightIndices: [i, selectedMin],
                    message: `Swap ${data[selectedMin]} with ${data[i]} to place the minimum at index ${i}.`,
                });
            } else {
                updateVisualization({
                    highlightIndices: [i],
                    message: `Index ${i} already contains the minimum value.`,
                });
            }
        }, delay));
        delay += 900;
    }

    animationTimeouts.push(setTimeout(() => {
        updateVisualization({ highlightIndices: [], message: 'Selection Sort complete! The array is sorted.' });
    }, delay));
}

function animateMergeSort(initialData) {
    const data = initialData.slice();
    const steps = [];

    function capture(message, leftIndex = null, rightIndex = null) {
        steps.push({ array: data.slice(), leftIndex, rightIndex, message });
    }

    function mergeSort(left, right) {
        if (left >= right) return;
        const mid = Math.floor((left + right) / 2);
        mergeSort(left, mid);
        mergeSort(mid + 1, right);
        const temp = [];
        let i = left;
        let j = mid + 1;

        while (i <= mid && j <= right) {
            if (Number(data[i]) <= Number(data[j])) {
                temp.push(data[i++]);
            } else {
                temp.push(data[j++]);
            }
        }
        while (i <= mid) temp.push(data[i++]);
        while (j <= right) temp.push(data[j++]);

        for (let k = left; k <= right; k++) {
            data[k] = temp[k - left];
            capture(`Merge segment [${left}..${right}]`, left, right);
        }
    }

    createVisualization('sorting', data, { message: 'Merge Sort will divide the array and merge sorted halves.' });
    capture('Starting Merge Sort...', 0, data.length - 1);
    mergeSort(0, data.length - 1);

    let delay = 200;
    steps.forEach(step => {
        animationTimeouts.push(setTimeout(() => {
            currentArrayData = step.array.slice();
            updateVisualization({
                leftIndex: step.leftIndex,
                rightIndex: step.rightIndex,
                highlightIndices: [],
                message: step.message,
            });
        }, delay));
        delay += 900;
    });

    animationTimeouts.push(setTimeout(() => {
        updateVisualization({ highlightIndices: [], leftIndex: null, rightIndex: null, message: 'Merge Sort complete! The array is now sorted.' });
    }, delay));
}

function animateQuickSort(initialData) {
    const data = initialData.slice();
    const steps = [];

    function capture(message, leftIndex = null, rightIndex = null, pivotIndex = null, highlightIndices = []) {
        steps.push({ array: data.slice(), leftIndex, rightIndex, pivotIndex, highlightIndices, message });
    }

    function partition(low, high) {
        const pivot = data[high];
        let i = low - 1;
        capture(`Choose pivot ${pivot} at index ${high}.`, low, high, high);

        for (let j = low; j < high; j++) {
            const currentJ = j;
            if (Number(data[currentJ]) < Number(pivot)) {
                i += 1;
                const temp = data[i];
                data[i] = data[currentJ];
                data[currentJ] = temp;
                capture(`Swap ${data[i]} and ${data[currentJ]}.`, low, high, high, [i, currentJ]);
            } else {
                capture(`Compare ${data[currentJ]} with pivot ${pivot}.`, low, high, high, [currentJ]);
            }
        }

        const pivotPosition = i + 1;
        const temp = data[pivotPosition];
        data[pivotPosition] = data[high];
        data[high] = temp;
        capture(`Place pivot ${pivot} at index ${pivotPosition}.`, low, high, pivotPosition, [pivotPosition, high]);
        return pivotPosition;
    }

    function quickSort(left, right) {
        if (left >= right) return;
        const pivotIndex = partition(left, right);
        quickSort(left, pivotIndex - 1);
        quickSort(pivotIndex + 1, right);
    }

    createVisualization('sorting', data, { message: 'Quick Sort will partition the array around pivot values.' });
    capture('Starting Quick Sort...', 0, data.length - 1, null, []);
    quickSort(0, data.length - 1);

    let delay = 200;
    steps.forEach(step => {
        animationTimeouts.push(setTimeout(() => {
            currentArrayData = step.array.slice();
            updateVisualization({
                leftIndex: step.leftIndex,
                rightIndex: step.rightIndex,
                pivotIndex: step.pivotIndex,
                highlightIndices: step.highlightIndices,
                message: step.message,
            });
        }, delay));
        delay += 900;
    });

    animationTimeouts.push(setTimeout(() => {
        updateVisualization({ highlightIndices: [], pivotIndex: null, leftIndex: null, rightIndex: null, message: 'Quick Sort complete! The array is now sorted.' });
    }, delay));
}

function animateHeapSort(initialData) {
    const data = initialData.slice();
    const steps = [];

    function capture(message, highlightIndices = [], leftIndex = null, rightIndex = null) {
        steps.push({ array: data.slice(), highlightIndices, leftIndex, rightIndex, message });
    }

    function heapify(length, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < length && Number(data[left]) > Number(data[largest])) {
            largest = left;
        }
        if (right < length && Number(data[right]) > Number(data[largest])) {
            largest = right;
        }

        if (largest !== i) {
            const temp = data[i];
            data[i] = data[largest];
            data[largest] = temp;
            capture(`Heapify: swapped ${data[largest]} and ${data[i]}.`, [i, largest], i, largest);
            heapify(length, largest);
        } else {
            capture(`Heapify: node at index ${i} is in correct position.`, [i], i, null);
        }
    }

    function buildHeap() {
        const length = data.length;
        for (let i = Math.floor(length / 2) - 1; i >= 0; i--) {
            heapify(length, i);
        }
        capture('Build max heap complete.', [], 0, data.length - 1);
    }

    function sort() {
        for (let end = data.length - 1; end > 0; end--) {
            const temp = data[0];
            data[0] = data[end];
            data[end] = temp;
            capture(`Moved max value ${data[end]} to sorted position ${end}.`, [0, end], 0, end);
            heapify(end, 0);
        }
        capture('Heap Sort complete.', [], 0, data.length - 1);
    }

    createVisualization('sorting', data, { message: 'Heap Sort will build a max heap and repeatedly extract the maximum element.' });
    capture('Starting Heap Sort...', [], 0, data.length - 1);
    buildHeap();
    sort();

    let delay = 200;
    steps.forEach(step => {
        animationTimeouts.push(setTimeout(() => {
            currentArrayData = step.array.slice();
            updateVisualization({
                leftIndex: step.leftIndex,
                rightIndex: step.rightIndex,
                highlightIndices: step.highlightIndices,
                message: step.message,
            });
        }, delay));
        delay += 900;
    });

    animationTimeouts.push(setTimeout(() => {
        updateVisualization({ highlightIndices: [], leftIndex: null, rightIndex: null, message: 'Heap Sort complete! The array is now sorted.' });
    }, delay));
}

function animateBinarySearch(target) {
    const data = ['1', '3', '5', '7', '9', '11', '13'];
    const targetValue = String(target).trim();
    if (!targetValue) {
        updateArrayMessage('Enter a target value first.');
        return;
    }

    createVisualization('search', data, { message: 'Starting Binary Search on a sorted array.' });
    let low = 0;
    let high = data.length - 1;
    let delay = 0;
    let found = false;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const currentLow = low;
        const currentHigh = high;
        const currentMid = mid;

        animationTimeouts.push(setTimeout(() => {
            updateVisualization({
                lowIndex: currentLow,
                highIndex: currentHigh,
                pivotIndex: currentMid,
                searchValue: targetValue,
                message: `Check middle index ${currentMid}: value ${data[currentMid]}.`,
            });
        }, delay));

        if (data[mid] === targetValue) {
            animationTimeouts.push(setTimeout(() => {
                updateVisualization({
                    highlightIndices: [mid],
                    message: `Found ${targetValue} at index ${mid}.`,
                });
            }, delay + 900));
            found = true;
            break;
        }

        if (Number(data[mid]) < Number(targetValue)) {
            low = mid + 1;
            animationTimeouts.push(setTimeout(() => {
                updateVisualization({
                    message: `Value ${data[mid]} is smaller than ${targetValue}, search right half.`,
                });
            }, delay + 900));
        } else {
            high = mid - 1;
            animationTimeouts.push(setTimeout(() => {
                updateVisualization({
                    message: `Value ${data[mid]} is larger than ${targetValue}, search left half.`,
                });
            }, delay + 900));
        }

        delay += 1800;
    }

    if (!found) {
        animationTimeouts.push(setTimeout(() => {
            updateVisualization({
                highlightIndices: [],
                message: `Target ${targetValue} not found in the array after binary search.`,
            });
        }, delay));
    }
}

window.accessArrayIndex = accessArrayIndex;
window.insertArrayValue = insertArrayValue;
window.deleteArrayIndex = deleteArrayIndex;
window.searchArrayValue = searchArrayValue;
window.insertLinkedListHead = insertLinkedListHead;
window.insertLinkedListTail = insertLinkedListTail;
window.deleteLinkedListValue = deleteLinkedListValue;
window.searchLinkedListValue = searchLinkedListValue;
window.animateLinkedListTraversal = animateLinkedListTraversal;
window.updateArrayVisualization = updateArrayVisualization;
window.updateVisualization = updateVisualization;
window.animateBubbleSort = animateBubbleSort;
window.animateInsertionSort = animateInsertionSort;
window.animateSelectionSort = animateSelectionSort;
window.animateMergeSort = animateMergeSort;
window.animateQuickSort = animateQuickSort;
window.animateHeapSort = animateHeapSort;
window.animateBinarySearch = animateBinarySearch;
