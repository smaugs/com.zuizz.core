<?php
/** @var $this ZUFEATURE */
/** @var $REST ZUREST */
$REST =& $this->rest;
$id = $REST->decodeID($this->values['identifier']);
try {
    $logs = ORM::for_table('log')->table_alias('l');

    $REST->select_fields($logs);
    $REST->sortorder($logs);

    if ($REST->expand_requested('user')) {
        $logs->left_outer_join('org_user', 'u.user_id = l.c_user_id', 'u');
        $REST->select_expands($logs, 'user');
    }


    $data = $logs->find_one($id)->as_array();
    $REST->clean_row($data);

    //  $data = $logs->find_array();
    //  $REST->clean_types($data);
    if ($logs) {
        $this->data['data'] = $data;
    } else {
        throw new Exception('no object with id ' . $this->values['identifier']);
    }

} catch (Exception $e) {
    ZU::header(404);
    $this->data['message'] = $e->getMessage();
}


// set default mimetype
if (!$this->mimetype) {
    $this->mimetype = 'json';
}

switch ($this->mimetype) {
    case "json":
        header('Content-type: application/json');
        $this->contentbuffer = json_encode($this->data);
        break;
    case "xml":
        header('Content-type: application/xml');
        ZU::load_class('lalit.array2xml', 'xml', true);
        $xml = Array2XML::createXML('machines', $this->data);
        $this->contentbuffer = $xml->saveXML();
        break;
}